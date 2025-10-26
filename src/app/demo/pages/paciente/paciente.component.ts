import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors
} from '@angular/forms';

import Swal from 'sweetalert2';
import Modal from 'bootstrap/js/dist/modal';
import { PacienteService } from './service/paciente.service';
import { Paciente } from './models/paciente';

@Component({
  selector: 'app-paciente',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './paciente.component.html',
  styleUrl: './paciente.component.scss'
})
export class PacienteComponent implements OnInit {
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  pacientes: Paciente[] = [];
  titleModal: string = '';
  titleBoton: string = '';
  pacienteSelected: Paciente = new Paciente();
  /**
   * Formulario para crear/editar paciente.*/

  form: FormGroup = new FormGroup({});

  constructor(
    private readonly pacienteService: PacienteService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
  }
  ngOnInit(): void {
    this.listarPacientes();
  }

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      id: [null],
      nombres: ['', [Validators.required, Validators.maxLength(50)]],
      apellidos: ['', [Validators.required, Validators.maxLength(50)]],
      tipoDocumento: ['', [Validators.required]],
      numeroDocumento: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      fechaNacimiento: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      telefono: [''],
      direccion: [''],
      usuarioId: [1, [Validators.required]]
    });
  } /**
   *  getter.
   */

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  } /**
   *
   */

  listarPacientes() {
    this.pacienteService.listarPacientes().subscribe({
      next: (data) => {
        this.pacientes = data;
      },
      error: (error) => {
        console.error('Error al obtener pacientes:', error);
        Swal.fire('Error', 'No se pudo cargar la lista de pacientes.', 'error');
      }
    });
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
    this.pacienteSelected = new Paciente();
  }

  abrirNuevoPaciente() {
    this.limpiarFormulario();
    this.openModal('C');
  }

  abrirEditarPaciente(paciente: Paciente) {
    this.pacienteSelected = paciente;
    this.form.patchValue({
      id: paciente.id,
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      tipoDocumento: paciente.tipoDocumento,
      numeroDocumento: paciente.numeroDocumento,
      fechaNacimiento: paciente.fechaNacimiento,
      genero: paciente.genero,
      telefono: paciente.telefono,
      direccion: paciente.direccion,
      usuarioId: paciente.usuarioId
    });
    this.openModal('E');
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Paciente' : 'Editar Paciente';
    this.titleBoton = modo === 'C' ? 'Guardar Paciente' : 'Actualizar Paciente';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearPaciente');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  guardarPaciente() {
    if (this.form.invalid) {
      Swal.fire('Error', 'Por favor, corrija los errores en el formulario.', 'error');
      return;
    }
    const datosFormulario: Paciente = this.form.value;

    const payload = {
      ...datosFormulario,
      documento: datosFormulario.numeroDocumento
    };

    if (this.modoFormulario === 'C') {
      this.pacienteService.crearPaciente(payload).subscribe({
        next: (data) => {
          Swal.fire('Éxito', data.mensaje, 'success');
          this.listarPacientes();
          this.closeModal();
        },
        error: (error) => {
          const mensajeError = error.error?.mensaje || error.error?.message || 'Error de conexión al servidor.';
          Swal.fire('Error', mensajeError, 'error');
        }
      });
    } else {
      payload.id = this.pacienteSelected.id;
      this.pacienteService.editarPaciente(payload).subscribe({
        next: (data) => {
          Swal.fire('Éxito', data.mensaje, 'success');
          this.listarPacientes();
          this.closeModal();
        },
        error: (error) => {
          const mensajeError = error.error?.mensaje || error.error?.message || 'Error de conexión al servidor.';
          Swal.fire('Error', mensajeError, 'error');
        }
      });
    }
  }
}
