import { Component } from '@angular/core';
import { PacienteService } from './service/paciente.service';
import { Paciente } from './models/paciente';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import Swal from 'sweetalert2';
import Modal from 'bootstrap/js/dist/modal';

@Component({
  selector: 'app-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './paciente.component.html',
  styleUrl: './paciente.component.scss'
})
export class PacienteComponent {
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  pacienteList: Paciente[] = [];
  titleModal: string = '';
  titleBoton: string = '';
  pacienteSelected: Paciente = new Paciente();

  form: FormGroup;

  constructor(
    private readonly pacienteService: PacienteService,
    private readonly formBuilder: FormBuilder
  ) {
    this.form = this.inicializarFormulario();
    this.listarPacientes();
  }

  inicializarFormulario(): FormGroup {
    return this.formBuilder.group({
      tipoDocumento: ['', [Validators.required]],
      numeroDocumento: ['', [Validators.required]],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      telefono: [''],
      direccion: ['']
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  listarPacientes() {
    this.pacienteService.listarPacientes().subscribe({
      next: (data) => (this.pacienteList = data),
      error: (error) => console.error('Error al listar pacientes:', error)
    });
  }

  closeModal() {
    if (this.modalInstance) this.modalInstance.hide();
    this.form.reset();
    this.pacienteSelected = new Paciente();
  }

  abrirNuevoPaciente() {
    this.pacienteSelected = new Paciente();
    this.form.reset();
    this.openModal('C');
  }

  abrirEditarPaciente(paciente: Paciente) {
    this.pacienteSelected = paciente;
    this.form.patchValue(paciente);
    this.openModal('E');
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Paciente' : 'Editar Paciente';
    this.titleBoton = modo === 'C' ? 'Guardar Paciente' : 'Actualizar Paciente';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearPaciente');
    if (modalElement) {
      this.modalInstance = new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  guardarPaciente() {
    if (this.form.invalid) {
      Swal.fire('Error', 'Por favor, corrija los errores del formulario.', 'error');
      return;
    }

    const payload: Paciente = { ...this.pacienteSelected, ...this.form.value };

    if (this.modoFormulario === 'C') {
      this.pacienteService.crearPaciente(payload).subscribe({
        next: (data) => {
          Swal.fire('Éxito', data.mensaje || 'Paciente creado correctamente', 'success');
          this.listarPacientes();
          this.closeModal();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.mensaje || 'No se pudo crear el paciente', 'error');
        }
      });
    } else {
      this.pacienteService.actualizarPaciente(payload).subscribe({
        next: (data) => {
          Swal.fire('Éxito', data.mensaje || 'Paciente actualizado correctamente', 'success');
          this.listarPacientes();
          this.closeModal();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.mensaje || 'No se pudo actualizar el paciente', 'error');
        }
      });
    }
  }
}
