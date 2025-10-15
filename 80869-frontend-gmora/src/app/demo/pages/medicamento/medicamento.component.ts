import { Component } from '@angular/core';
import { MedicamentoService } from './service/medicamento.service';
import { Medicamento } from './models/medicamento';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';
import Swal from 'sweetalert2';

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
  medicamentoSelected: Medicamento = new Medicamento();

  constructor(
    private readonly medicamentoService: MedicamentoService,
    private readonly formBuilder: FormBuilder
  ) {
    this.listarMedicamentos();
    this.inicializarFormulario();
  }

  /**
   * Formulario para crear/editar medicamento.
   */
  form: FormGroup = new FormGroup({
    nombre: new FormControl(''),
    descripcion: new FormControl(''),
    laboratorio: new FormControl(''),
    concentracion: new FormControl(''),
    formaFarmaceutica: new FormControl(''),
    fechaVencimiento: new FormControl(''),
    precio: new FormControl(''),
    stock: new FormControl(''),
    activo: new FormControl(true)
  });

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required]],
      laboratorio: ['', [Validators.required]],
      concentracion: ['', [Validators.required]],
      formaFarmaceutica: ['', [Validators.required]],
      fechaVencimiento: ['', [Validators.required]],
      precio: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      activo: [true]
    });
  }

  /**
   * Getter para acceder a los controles del formulario.
   */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  listarMedicamentos() {
    this.medicamentoService.listarMedicamentos().subscribe({
      next: (data) => {
        this.medicamentoList = data;
      },
      error: (error) => {
        console.error('Error fetching medicamentos:', error);
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
    this.medicamentoSelected = new Medicamento();
    this.form.patchValue({ activo: true });
  }

  guardarMedicamento() {
    if (this.form.valid) {
      const medicamento = { ...this.form.value };
      
      if (this.modoFormulario === 'C') {
        this.medicamentoService.crearMedicamento(medicamento).subscribe({
          next: () => {
            Swal.fire('Éxito', 'Medicamento creado correctamente.', 'success');
            this.listarMedicamentos();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error creating medicamento:', error);
            Swal.fire('Error', 'No se pudo crear el medicamento.', 'error');
          }
        });
      } else if (this.modoFormulario === 'E') {
        medicamento.id = this.medicamentoSelected.id;
        this.medicamentoService.actualizarMedicamento(medicamento).subscribe({
          next: () => {
            Swal.fire('Éxito', 'Medicamento actualizado correctamente.', 'success');
            this.listarMedicamentos();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating medicamento:', error);
            Swal.fire('Error', 'No se pudo actualizar el medicamento.', 'error');
          }
        });
      }
    } else {
      Swal.fire('Formulario inválido', 'Por favor completa todos los campos requeridos.', 'warning');
    }
  }

  abrirMedicamentoModal() {
    this.openModal('C');
  }

  editarModalMedicamento(medicamento: Medicamento) {
    this.medicamentoSelected = medicamento;
    this.form.patchValue({
      nombre: medicamento.nombre,
      descripcion: medicamento.descripcion,
      laboratorio: medicamento.laboratorio,
      concentracion: medicamento.concentracion,
      formaFarmaceutica: medicamento.formaFarmaceutica,
      fechaVencimiento: medicamento.fechaVencimiento,
      precio: medicamento.precio,
      stock: medicamento.stock,
      activo: medicamento.activo
    });
    this.openModal('E');
  }

  eliminarMedicamento(medicamento: Medicamento) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el medicamento "${medicamento.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.medicamentoService.eliminarMedicamento(medicamento.id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El medicamento ha sido eliminado.', 'success');
            this.listarMedicamentos();
          },
          error: (error) => {
            console.error('Error deleting medicamento:', error);
            Swal.fire('Error', 'No se pudo eliminar el medicamento.', 'error');
          }
        });
      }
    });
  }
}