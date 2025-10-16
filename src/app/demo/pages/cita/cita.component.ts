import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';
import Swal from 'sweetalert2';
import { CitaService } from './service/cita.service';
import { Cita } from './models/cita';
import { CitaRq } from './models/cita-rq';

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
  citaSelected!: Cita;

  constructor(
    private readonly citaService: CitaService,
    private readonly formBuilder: FormBuilder
  ) {
    this.listarCitas();
    this.inicializarFormulario();
  }

  form: FormGroup = new FormGroup({
    fecha: new FormControl(''),
    hora: new FormControl(''),
    pacienteId: new FormControl(''),
    medicoId: new FormControl(''),
    estado: new FormControl(''),
    motivo: new FormControl('')
  });

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      fecha: ['', [Validators.required]],
      hora: ['', [Validators.required]],
      pacienteId: ['', [Validators.required]],
      medicoId: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      motivo: ['', [Validators.required]]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  listarCitas() {
    this.citaService.listarCitas().subscribe({
      next: (data) => {
        this.citaList = data;
      },
      error: (error) => {
        console.error('Error al obtener citas:', error);
        Swal.fire('Error', 'No se pudieron cargar las citas.', 'error');
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
  }

  guardarCita() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dto: CitaRq = this.form.value as CitaRq;
    // transformar fecha + hora en fechaHora ISO
    const fecha = this.form.get('fecha')?.value;
    const hora = this.form.get('hora')?.value;
    const fechaHoraIso = fecha && hora ? new Date(fecha + 'T' + hora).toISOString() : new Date().toISOString();
    dto.fechaHora = fechaHoraIso;

    if (this.modoFormulario === 'C') {
      this.citaService.crearCita(dto).subscribe({
        next: () => {
          Swal.fire('Ok', 'Cita creada correctamente', 'success');
          this.closeModal();
          this.listarCitas();
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo crear la cita', 'error');
        }
      });
    } else {
      // cuando es editar, incluimos id si existe
      const payload: CitaRq = { ...dto };
      if (this.citaSelected && this.citaSelected.id) {
        payload.id = this.citaSelected.id;
      }
      this.citaService.actualizarCita(payload).subscribe({
        next: () => {
          Swal.fire('Ok', 'Cita actualizada correctamente', 'success');
          this.closeModal();
          this.listarCitas();
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo actualizar la cita', 'error');
        }
      });
    }
  }

  abrirCitaModal() {
    this.openModal('C');
  }

  editarModalCita(cita: Cita) {
    this.citaSelected = cita;
    // si cita.fechaHora es ISO, separarla en fecha y hora para el formulario
    let fecha = '';
    let hora = '';
    if (cita.fechaHora) {
      const d = new Date(cita.fechaHora);
      fecha = d.toISOString().slice(0,10);
      hora = d.toISOString().slice(11,16);
    }
    this.form.patchValue({
      fecha: fecha,
      hora: hora,
      pacienteId: (cita as any).pacienteId || '',
      medicoId: (cita as any).medicoId || '',
      estado: cita.estado || '',
      motivo: cita.motivo
    });
    this.openModal('E');
  }
}
