import { Component } from '@angular/core';
import { PacienteService } from './service/paciente.service';
import { Paciente } from './models/paciente';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { UtilApiService } from 'src/app/services/common/util-api.service';
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';

@Component({
  selector: 'app-paciente',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.scss']
})
export class PacienteComponent {
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  titleModal: string = '';
  titleBoton: string = '';
  pacienteList: Paciente[] = [];
  pacienteSelected: Paciente | null = null;
  msjSpinner: string = 'Probando spinner ....';

  // filtros por columna
  filtros: any = {
    tipoDocumento: '',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    genero: '',
    telefono: '',
    direccion: ''
  };

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
    private readonly utilApiService: UtilApiService,
    private readonly formBuilder: FormBuilder,
    private readonly spinner: NgxSpinnerService
  ) {
    this.listarPacientes();
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      tipoDocumento: ['', [Validators.required]],
      numeroDocumento: ['', [Validators.required, Validators.minLength(6)]],
      nombres: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      direccion: ['', [Validators.required]]
    });
  }

  get f(): any {
    return this.form.controls;
  }

  listarPacientes() {
    this.spinner.show();
    this.pacienteService.listarPacientes().subscribe({
      next: (data) => {
        this.spinner.hide();
        this.pacienteList = data;
      },
      error: (error) => {
        this.spinner.hide();
        console.error('Error fetching pacientes:', error);
      }
    });
  }

  // lista filtrada calculada en cliente
  get pacientesFiltrados(): Paciente[] {
    return this.pacienteList.filter(p => {
      const f = this.filtros;
      const match = (val: any, filtro: string) => {
        if (!filtro) return true;
        if (val == null) return false;
        return String(val).toLowerCase().includes(String(filtro).toLowerCase());
      };
      return (
        match(p.tipoDocumento, f.tipoDocumento) &&
        match(p.numeroDocumento, f.numeroDocumento) &&
        match(p.nombres, f.nombres) &&
        match(p.apellidos, f.apellidos) &&
        match(p.fechaNacimiento, f.fechaNacimiento) &&
        match(p.genero, f.genero) &&
        match(p.telefono, f.telefono) &&
        match(p.direccion, f.direccion)
      );
    });
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear paciente' : 'Editar paciente';
    this.titleBoton = modo === 'C' ? 'Guardar paciente' : 'Actualizar paciente';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearPaciente');
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
    this.pacienteSelected = null;
  }

  guardarPaciente() {
    this.msjSpinner = this.modoFormulario === 'C' ? 'Creando paciente ...' : 'Actualizando paciente ...';
    this.spinner.show();
    if (this.form.invalid) {
      this.spinner.hide();
      Swal.fire('Error', 'Por favor, corrija los errores en el formulario.', 'error');
      return;
    }
    if (this.modoFormulario === 'C') {
      this.pacienteService.guardarPaciente(this.form.value).subscribe({
        next: (data) => {
          this.spinner.hide();
          Swal.fire('Éxito', data.mensaje, 'success');
          this.listarPacientes();
          this.closeModal();
        },
        error: (error) => {
          this.spinner.hide();
          Swal.fire('Error', error.error?.message || 'Error al crear paciente', 'error');
        }
      });
    } else {
      const pacienteActualizar = { ...this.pacienteSelected, ...this.form.value } as Paciente;
      this.pacienteService.actualizarPaciente(pacienteActualizar).subscribe({
        next: (data) => {
          this.spinner.hide();
          Swal.fire('Éxito', data.mensaje, 'success');
          this.listarPacientes();
          this.closeModal();
        },
        error: (error) => {
          this.spinner.hide();
          Swal.fire('Error', error.error?.message || 'Error al actualizar paciente', 'error');
        }
      });
    }
  }

  abrirPacienteModal() {
    this.openModal('C');
  }

  editarModalPaciente(paciente: Paciente) {
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
}
