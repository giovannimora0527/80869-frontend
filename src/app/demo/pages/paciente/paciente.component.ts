import { Component } from '@angular/core';
import { PacienteService } from './service/paciente.service';
import { Paciente } from './models/paciente';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl  } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';
import Swal from 'sweetalert2';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-paciente',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxSpinnerModule, NgbModule],
  templateUrl: './paciente.component.html',
  styleUrl: './paciente.component.scss'
})
export class PacienteComponent {
  pacienteList: Paciente[] = [];
  pacienteSelected: Paciente;
  titleModal: string;
  titleBoton: string;
  modoFormulario: String;
  modalInstance: Modal | null = null;
  msjSpinner: string = 'Cargando Datos...';

  constructor(
    private readonly pacienteService: PacienteService,
    private readonly formBuilder: FormBuilder,
    private readonly spinner: NgxSpinnerService,) {
    this.listarPacientes();
    this.inicializarFormulario();
  }

  /**
     * Formulario para crear/editar usuario.
     */
    form: FormGroup = new FormGroup({
      tipoDocumento: new FormControl(''),
      numeroDocumento: new FormControl(''),
      nombres: new FormControl(''),
      apellidos: new FormControl(''),
      telefono: new FormControl(''),
      direccion: new FormControl(''),
      fechaNacimiento: new FormControl(''),
      genero: new FormControl('')
    });

    inicializarFormulario() {
        this.form = this.formBuilder.group({
          tipoDocumento: ['', [Validators.required]],
          numeroDocumento: ['', [Validators.required, Validators.minLength(8)]],
          nombres: ['', [Validators.required, Validators.minLength(3)]],
          apellidos: ['', [Validators.required]],
          direccion: ['', [Validators.required]],
          fechaNacimiento: ['', [Validators.required]],
          genero: ['', [Validators.required]],
          telefono: ['', [Validators.required]],
        });
      }

  listarPacientes() {
    this.pacienteService.listarPacientes().subscribe({
      next: (data) => {
        console.log(data);
        this.pacienteList = data;
      },
      error: (error) => {
        console.error('Error fetching pacientes:', error);
      }
    });
  }

  openModal(modo: string) {
      this.titleModal = modo === 'C' ? 'Crear Paciente' : 'Editar Paciente';
      this.titleBoton = modo === 'C' ? 'Guardar Paciente' : 'Actualizar Paciente';
      this.modoFormulario = modo;
      const modalElement = document.getElementById('modalCrearPaciente');
      if (modalElement) {
        // Verificar si ya existe una instancia del modal
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

  guardarPaciente() {
      this.msjSpinner = this.modoFormulario === 'C' ? 'Creando paciente ...' : 'Actualizando paciente ...';
      this.spinner.show();
      if (this.form.invalid) {
        this.spinner.hide();
        Swal.fire('Error', 'Por favor, corrija los errores en el formulario.', 'error');
      }
      if (this.modoFormulario === 'C') {
        // Creacion
        this.pacienteService.guardarPaciente(this.form.value).subscribe({
          next: (data) => {
            this.spinner.hide();
            Swal.fire('Éxito', data.mensaje, 'success');
            this.listarPacientes();
            this.closeModal();
          },
          error: (error) => {
            this.spinner.hide();
            Swal.fire('Error', error.error.message, 'error');
          }
        });
      } else {
        const medicoActualizar = { ...this.pacienteSelected, ...this.form.value };
        // Edicion o actualizar
         this.pacienteService.actualizarPaciente(medicoActualizar).subscribe({
          next: (data) => {
            this.spinner.hide();
            Swal.fire('Éxito', data.mensaje, 'success');
            this.listarPacientes();
            this.closeModal();
          },
          error: (error) => {
            this.spinner.hide();
            Swal.fire('Error', error.error.message, 'error');
          }
        });
      }
    }
  editarModalPaciente(paciente: Paciente) {
      this.pacienteSelected = paciente;
      this.openModal('E');
  }

  abrirPacienteModal() {
    this.openModal('C');
  }

  probarBoton(paciente: Paciente) {
    console.log(paciente);
  }
}
