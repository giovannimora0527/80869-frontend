import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import CitaService from 'src/app/demo/pages/cita/service/cita.service';
import { Cita } from './models/cita';
import Swal from 'sweetalert2';
import Modal from 'bootstrap/js/dist/modal';

@Component({
  selector: 'app-cita',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cita.component.html',
  styles: [':host { display: block; }']
})
export class CitaComponent {
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  titleModal: string = '';
  titleBoton: string = '';
  citaList: Cita[] = [];
  citaSelected?: Cita;

  private readonly citaService = inject(CitaService);

  constructor(
    private readonly formBuilder: FormBuilder
  ) {
    this.listarCitas();
    this.inicializarFormulario();
  }

  form: FormGroup = new FormGroup({
    fecha: new FormControl(''),
    hora: new FormControl(''),
    motivo: new FormControl(''),
    estado: new FormControl('')
  });

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      fecha: ['', [Validators.required]],
      hora: ['', [Validators.required]],
      motivo: ['', [Validators.required]],
      estado: ['', [Validators.required]]
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
        console.error('Error al listar citas:', error);
      }
    });
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Cita' : 'Editar Cita';
    this.titleBoton = modo === 'C' ? 'Guardar Cita' : 'Actualizar Cita';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearCita');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  closeModal() {
    if (this.modalInstance) this.modalInstance.hide();
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  guardarCita() {
    Swal.fire('Guardando cita', 'Se ejecuta la función guardar cita.', 'info');
  }

  abrirCitaModal() {
    this.openModal('C');
  }

  editarModalCita(cita: Cita) {
    this.citaSelected = cita;
    this.openModal('E');
  }
}
