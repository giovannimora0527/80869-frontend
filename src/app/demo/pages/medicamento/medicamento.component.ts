
import { Component } from '@angular/core';
import { MedicamentoService } from './service/medicamento.service';
import { Medicamento } from './models/medicamento';
import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';

@Component({
  selector: 'app-medicamento',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './medicamento.component.html',
  styleUrl: './medicamento.component.scss'
})
export class MedicamentoComponent {
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  titleModal: string = '';
  titleBoton: string = '';
  medicamentoList: Medicamento[] = [];
  medicamentoSelected: Medicamento;

  constructor(
    private readonly medicamentoService: MedicamentoService,
    private readonly formBuilder: FormBuilder
  ) {
    this.listarMedicamentos();
    this.inicializarFormulario();
  }

  form: FormGroup = new FormGroup({
    nombre: new FormControl(''),
    descripcion: new FormControl(''),
    presentacion: new FormControl(''),
    fechaCompra: new FormControl(''),
    fechaVence: new FormControl('')
  });

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      presentacion: ['', [Validators.required]],
      fechaCompra: ['', [Validators.required]],
      fechaVence: ['', [Validators.required]]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  listarMedicamentos() {
    this.medicamentoService.listarMedicamentos().subscribe({
      next: (data) => {
        this.medicamentoList = data;
      },
      error: (error) => {
        console.error('Error al obtener medicamentos:', error);
        Swal.fire('Error', 'No se pudieron cargar los medicamentos.', 'error');
      }
    });
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear medicamento' : 'Editar medicamento';
    this.titleBoton = modo === 'C' ? 'Guardar medicamento' : 'Actualizar medicamento';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearMedicamento');
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

  guardarMedicamento() {
    Swal.fire('Guardando medicamento', 'Esta usando la función guardar medicamento.', 'info');
  }

  abrirMedicamentoModal() {
    this.openModal('C');
  }

  editarModalMedicamento(medicamento: Medicamento) {
    this.medicamentoSelected = medicamento;
    this.openModal('E');
  }
}
