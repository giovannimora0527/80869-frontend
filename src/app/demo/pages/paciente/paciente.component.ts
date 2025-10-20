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
  ReactiveFormsModule,
  ValidationErrors
} from '@angular/forms';

import Swal from 'sweetalert2';
// Importa los objetos necesarios de Bootstrap
import Modal from 'bootstrap/js/dist/modal';
import { delay, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-paciente',
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

  form: FormGroup = new FormGroup({
    tipoDocumento: new FormControl(''),
    numeroDocumento: new FormControl(''),
    nombres: new FormControl(''),
    apellidos: new FormControl(''),
    fechaNacimiento: new FormControl(''),
    genero: new FormControl(''),
    telefono: new FormControl(''),
    direccion: new FormControl('')
  });

  constructor(
    private readonly pacienteService: PacienteService,
    private readonly formBuilder: FormBuilder
  ) {
    this.listarPacientes();
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      tipoDocumento: ['', [Validators.required]],
      numeroDocumento: ['', [Validators.required]],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      telefono: ['', []],
      direccion: ['', []]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  listarPacientes() {
    this.pacienteService.listarPacientes().subscribe({
      next: (data) => {
        this.pacienteList = data;
      },
      error: (error) => {
        console.error('Error fetching pacientes:', error);
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
    this.pacienteSelected = new Paciente();
    this.limpiarFormulario();
    this.openModal('C');
  }

  abrirEditarPaciente(paciente: Paciente) {
    this.pacienteSelected = paciente;
    this.form.patchValue({
      tipoDocumento: paciente.tipoDocumento,
      numeroDocumento: paciente.numeroDocumento,
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      fechaNacimiento: paciente.fechaNacimiento,
      genero: paciente.genero,
      telefono: paciente.telefono,
      direccion: paciente.direccion
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

    const payload: Paciente = { ...this.pacienteSelected, ...this.form.value } as Paciente;

    if (this.modoFormulario === 'C') {
      this.pacienteService.crearPaciente(payload).subscribe({
        next: (data) => {
          Swal.fire('Éxito', data?.mensaje ?? 'Paciente creado', 'success');
          this.listarPacientes();
          this.closeModal();
        },
        error: (error) => {
          Swal.fire('Error', error?.error?.message ?? 'Error al crear paciente', 'error');
        }
      });
    } else {
      this.pacienteService.actualizarPaciente(payload).subscribe({
        next: (data) => {
          Swal.fire('Éxito', data?.mensaje ?? 'Paciente actualizado', 'success');
          this.listarPacientes();
          this.closeModal();
        },
        error: (error) => {
          Swal.fire('Error', error?.error?.message ?? 'Error al actualizar paciente', 'error');
        }
      });
    }
  }

}
