import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MedicamentoService } from './service/medicamento.service';
import { Medicamento } from './models/medicamento';
import Swal from 'sweetalert2';
import Modal from 'bootstrap/js/dist/modal';

@Component({
  selector: 'app-medicamento',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './medicamento.component.html',
  styleUrl: './medicamento.component.scss'
})
export class MedicamentoComponent {
  medicamentoList: Medicamento[] = [];
  medicamentoSelected: Medicamento;
  modalInstance: Modal | null = null;
  modoFormulario = '';
  titleModal = '';
  titleBoton = '';

  form: FormGroup = new FormGroup({});

  constructor(
    private readonly medicamentoService: MedicamentoService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
    this.listarMedicamentos();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      presentacion: ['', [Validators.required]]
    });
  }

  listarMedicamentos() {
    this.medicamentoService.listarMedicamentos().subscribe({
      next: (data) => {
        this.medicamentoList = data;
      },
      error: (error) => {
        console.error('Error al obtener medicamentos', error);
        Swal.fire('Error', 'No se pudieron cargar los medicamentos.', 'error');
      }
    });
  }

  abrirModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Agregar medicamento' : 'Editar medicamento';
    this.titleBoton = modo === 'C' ? 'Guardar medicamento' : 'Actualizar medicamento';
    this.modoFormulario = modo;

    const modalElement = document.getElementById('modalCrearMedicamento');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }

    if (modo === 'C') {
      this.limpiarFormulario();
    }
  }

  cerrarModal() {
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = this.form.value;

    if (this.modoFormulario === 'C') {
      this.medicamentoService.crearMedicamento(formData).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Medicamento creado exitosamente', 'success');
          this.cerrarModal();
          this.listarMedicamentos();
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo crear el medicamento', 'error');
        }
      });
    } else if (this.modoFormulario === 'E') {
      const medicamentoActualizado: Medicamento = {
        ...this.medicamentoSelected,
        ...formData
      };

      this.medicamentoService.actualizarMedicamento(medicamentoActualizado).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Medicamento actualizado exitosamente', 'success');
          this.cerrarModal();
          this.listarMedicamentos();
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo actualizar el medicamento', 'error');
        }
      });
    }
  }

  editarMedicamento(medicamento: Medicamento) {
    this.medicamentoSelected = medicamento;
    this.form.patchValue(medicamento);
    this.abrirModal('E');
  }
}

