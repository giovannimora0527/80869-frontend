import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';
import Swal from 'sweetalert2';
import { EspecializacionService } from './service/especializacion.service';
import { Especializacion } from './models/especializacion';
import { EspecializacionRq } from './models/especializacion-rq';

@Component({
  selector: 'app-especializacion',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './especializacion.component.html',
  styleUrl: './especializacion.component.scss'
})
export class EspecializacionComponent {
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  titleModal: string = '';
  titleBoton: string = '';
  especializacionList: Especializacion[] = [];
  especializacionSelected!: Especializacion;

  constructor(
    private readonly especializacionService: EspecializacionService,
    private readonly formBuilder: FormBuilder
  ) {
    this.listarEspecializaciones();
    this.inicializarFormulario();
  }

  form: FormGroup = new FormGroup({
    nombre: new FormControl(''),
    descripcion: new FormControl(''),
    codigoEspecializacion: new FormControl('')
  });

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]]
      ,codigoEspecializacion: ['']
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  listarEspecializaciones() {
    this.especializacionService.listarEspecializaciones().subscribe({
      next: (data) => {
        this.especializacionList = data;
      },
      error: (error) => {
        console.error('Error al obtener especializaciones:', error);
        Swal.fire('Error', 'No se pudieron cargar las especializaciones.', 'error');
      }
    });
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear especialización' : 'Editar especialización';
    this.titleBoton = modo === 'C' ? 'Guardar' : 'Actualizar';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearEspecializacion');
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

  guardarEspecializacion() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dto: EspecializacionRq = this.form.value as EspecializacionRq;
    if (this.modoFormulario === 'C') {
      this.especializacionService.crearEspecializacion(dto).subscribe({
        next: () => {
          Swal.fire('Ok', 'Especialización creada correctamente', 'success');
          this.closeModal();
          this.listarEspecializaciones();
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo crear la especialización', 'error');
        }
      });
    } else {
      const payload: EspecializacionRq = { ...dto };
      if (this.especializacionSelected && this.especializacionSelected.id) {
        payload.id = this.especializacionSelected.id;
      }
      this.especializacionService.actualizarEspecializacion(payload).subscribe({
        next: () => {
          Swal.fire('Ok', 'Especialización actualizada correctamente', 'success');
          this.closeModal();
          this.listarEspecializaciones();
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo actualizar la especialización', 'error');
        }
      });
    }
  }

  abrirEspecializacionModal() {
    this.openModal('C');
  }

  editarModalEspecializacion(e: Especializacion) {
    this.especializacionSelected = e;
    this.form.patchValue({
      nombre: e.nombre,
      descripcion: e.descripcion
      ,codigoEspecializacion: (e as any).codigoEspecializacion || ''
    });
    this.openModal('E');
  }
}
