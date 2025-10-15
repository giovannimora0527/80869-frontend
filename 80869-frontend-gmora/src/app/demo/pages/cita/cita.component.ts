import { Component } from '@angular/core';
import { CitaService } from './service/cita.service';
import { PacienteService } from '../paciente/service/paciente.service';
import { MedicoService } from '../medico/service/medico.service';
import { Cita } from './models/cita';
import { Paciente } from '../paciente/models/paciente';
import { Medico } from '../medico/models/medico';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cita',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cita.component.html',
  styleUrl: './cita.component.scss'
})
export class CitaComponent {
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  titleModal: string = '';
  titleBoton: string = '';
  citaList: Cita[] = [];
  pacienteList: Paciente[] = [];
  medicoList: Medico[] = [];
  citaSelected: Cita = new Cita();

  constructor(
    private readonly citaService: CitaService,
    private readonly pacienteService: PacienteService,
    private readonly medicoService: MedicoService,
    private readonly formBuilder: FormBuilder
  ) {
    this.listarCitas();
    this.cargarPacientes();
    this.cargarMedicos();
    this.inicializarFormulario();
  }

  /**
   * Formulario para crear/editar cita.
   */
  form: FormGroup = new FormGroup({
    pacienteId: new FormControl(''),
    medicoId: new FormControl(''),
    fechaHora: new FormControl(''),
    estado: new FormControl('PROGRAMADA'),
    motivo: new FormControl(''),
    observaciones: new FormControl('')
  });

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      pacienteId: ['', [Validators.required]],
      medicoId: ['', [Validators.required]],
      fechaHora: ['', [Validators.required]],
      estado: ['PROGRAMADA', [Validators.required]],
      motivo: ['', [Validators.required, Validators.minLength(5)]],
      observaciones: ['']
    });
  }

  /**
   * Getter para acceder a los controles del formulario.
   */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  listarCitas() {
    this.citaService.listarCitas().subscribe({
      next: (data) => {
        this.citaList = data;
      },
      error: (error) => {
        console.error('Error fetching citas:', error);
        Swal.fire('Error', 'No se pudieron cargar las citas.', 'error');
      }
    });
  }

  cargarPacientes() {
    this.pacienteService.listarPacientes().subscribe({
      next: (data) => {
        this.pacienteList = data;
      },
      error: (error) => {
        console.error('Error fetching pacientes:', error);
      }
    });
  }

  cargarMedicos() {
    this.medicoService.listarMedicos().subscribe({
      next: (data) => {
        this.medicoList = data;
      },
      error: (error) => {
        console.error('Error fetching medicos:', error);
      }
    });
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear cita' : 'Editar cita';
    this.titleBoton = modo === 'C' ? 'Guardar cita' : 'Actualizar cita';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearCita');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.citaSelected = new Cita();
    this.form.patchValue({ estado: 'PROGRAMADA' });
  }

  guardarCita() {
    if (this.form.valid) {
      const cita = { ...this.form.value };
      
      if (this.modoFormulario === 'C') {
        this.citaService.crearCita(cita).subscribe({
          next: () => {
            Swal.fire('Éxito', 'Cita creada correctamente.', 'success');
            this.listarCitas();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error creating cita:', error);
            Swal.fire('Error', 'No se pudo crear la cita.', 'error');
          }
        });
      } else if (this.modoFormulario === 'E') {
        cita.id = this.citaSelected.id;
        this.citaService.actualizarCita(cita).subscribe({
          next: () => {
            Swal.fire('Éxito', 'Cita actualizada correctamente.', 'success');
            this.listarCitas();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating cita:', error);
            Swal.fire('Error', 'No se pudo actualizar la cita.', 'error');
          }
        });
      }
    } else {
      Swal.fire('Formulario inválido', 'Por favor completa todos los campos requeridos.', 'warning');
    }
  }

  abrirCitaModal() {
    this.openModal('C');
  }

  editarModalCita(cita: Cita) {
    this.citaSelected = cita;
    // Formatear fecha para datetime-local input
    const fechaFormateada = new Date(cita.fechaHora).toISOString().slice(0, 16);
    
    this.form.patchValue({
      pacienteId: cita.paciente?.numeroDocumento || '',
      medicoId: cita.medico?.id || '',
      fechaHora: fechaFormateada,
      estado: cita.estado,
      motivo: cita.motivo,
      observaciones: cita.observaciones
    });
    this.openModal('E');
  }

  eliminarCita(cita: Cita) {
    const pacienteNombre = cita.paciente ? `${cita.paciente.nombres} ${cita.paciente.apellidos}` : 'Paciente';
    
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la cita de "${pacienteNombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.citaService.eliminarCita(cita.id).subscribe({
          next: () => {
            Swal.fire('Eliminada', 'La cita ha sido eliminada.', 'success');
            this.listarCitas();
          },
          error: (error) => {
            console.error('Error deleting cita:', error);
            Swal.fire('Error', 'No se pudo eliminar la cita.', 'error');
          }
        });
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'PROGRAMADA':
        return 'bg-primary';
      case 'CONFIRMADA':
        return 'bg-success';
      case 'COMPLETADA':
        return 'bg-info';
      case 'CANCELADA':
        return 'bg-danger';
      case 'NO_ASISTIO':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }
}