import { Component } from '@angular/core';
import { PacienteService } from './service/paciente.service';
import { Paciente } from './models/paciente';
import { PacienteRq } from './models/paciente-rq';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
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
  pacienteSelected!: Paciente;
  msjSpinner: string = 'Cargando...';

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
    private readonly formBuilder: FormBuilder,
    private readonly spinner: NgxSpinnerService
  ) {
    this.listarPacientes();
    this.inicializarFormulario();
  }

  // ✅ Inicializa validaciones del formulario
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      tipoDocumento: ['', [Validators.required]],
      numeroDocumento: ['', [Validators.required, Validators.minLength(5)]],
      nombres: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      fechaNacimiento: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      direccion: ['', [Validators.required]]
    });
  }

  // ✅ Atajo para acceder fácilmente a los controles del formulario
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  // ✅ Obtiene la lista de pacientes desde el backend
  listarPacientes() {
    this.spinner.show();
    this.pacienteService.listarPacientes().subscribe({
      next: (data) => {
        this.spinner.hide();
        this.pacienteList = data;
      },
      error: (error) => {
        this.spinner.hide();
        console.error('Error al listar pacientes:', error);
      }
    });
  }

  // ✅ Abre el modal para crear o editar
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

  // ✅ Cierra el modal
  closeModal() {
    if (this.modalInstance) this.modalInstance.hide();
    this.limpiarFormulario();
  }

  // ✅ Limpia el formulario
  limpiarFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  // ✅ Crea o actualiza un paciente
  guardarPaciente() {
    if (this.form.invalid) {
      Swal.fire('Error', 'Por favor, corrija los errores en el formulario.', 'error');
      return;
    }

    const pacienteRq: PacienteRq = this.form.value;
    this.msjSpinner = this.modoFormulario === 'C' ? 'Creando paciente...' : 'Actualizando paciente...';
    this.spinner.show();

    // Si estamos editando, agregamos el id al request
    if (this.modoFormulario === 'E' && this.pacienteSelected?.id) {
      (pacienteRq as any).id = this.pacienteSelected.id;
    }

    this.pacienteService.guardarPaciente(pacienteRq).subscribe({
      next: (data) => {
        this.spinner.hide();
        Swal.fire('Éxito', data.mensaje, 'success');
        this.listarPacientes();
        this.closeModal();
      },
      error: (error) => {
        this.spinner.hide();
        const mensaje = error?.error?.mensaje || 'Error al guardar el paciente';
        Swal.fire('Error', mensaje, 'error');
      }
    });
  }

  // ✅ Abre el modal para registrar un nuevo paciente
  abrirPacienteModal() {
    this.limpiarFormulario();
    this.openModal('C');
  }

  // ✅ Abre el modal para editar un paciente existente
  editarModalPaciente(paciente: Paciente) {
    this.pacienteSelected = paciente;
    this.form.patchValue(paciente);
    this.openModal('E');
  }
}
