import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, AbstractControl } from '@angular/forms';
import { EspecializacionService } from './service/especializacion.service';
import { Especializacion } from './models/especializacion';
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-especializacion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './especializacion.component.html',
  styleUrls: ['./especializacion.component.scss']
})
export class EspecializacionComponent implements OnInit {
  especializacionList: Especializacion[] = [];
  form: FormGroup;
  modoFormulario: 'C' | 'E' = 'C';
  titleModal = '';
  titleBoton = '';
  modalInstance?: Modal;
  especializacionSelected: Especializacion | null = null;

  constructor(
    private fb: FormBuilder,
    private especializacionService: EspecializacionService
  ) {
    this.form = this.fb.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],
      codigoEspecializacion: ['', [Validators.required, Validators.maxLength(20)]]
    });
  }

  ngOnInit(): void {
    this.listarEspecializaciones();
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  listarEspecializaciones(): void {
    this.especializacionService.listarEspecializaciones().subscribe({
      next: (data) => this.especializacionList = data,
      error: () => Swal.fire('Error', 'No se pudo cargar las especializaciones.', 'error')
    });
  }

  abrirNuevaEspecializacion(): void {
    this.form.reset();
    this.modoFormulario = 'C';
    this.titleModal = 'Registrar Especialización';
    this.titleBoton = 'Guardar';
    this.especializacionSelected = null;
    this.showModal();
  }

  abrirEditarEspecializacion(especializacion: Especializacion): void {
    this.especializacionSelected = especializacion;
    this.form.patchValue({ ...especializacion });
    this.modoFormulario = 'E';
    this.titleModal = 'Editar Especialización';
    this.titleBoton = 'Actualizar';
    this.showModal();
  }

  guardarEspecializacion(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire('Error', 'Corrija los errores en el formulario.', 'error');
      return;
    }

    const payload: Especializacion = this.form.value; // incluye id si es edición

    if (this.modoFormulario === 'C') {
      this.especializacionService.guardarEspecializacion(payload).subscribe({
        next: (rta) => {
          Swal.fire('Éxito', rta.mensaje || 'Especialización registrada.', 'success');
          this.closeModal();
          this.listarEspecializaciones();
        },
        error: (err) => Swal.fire('Error', err.error?.mensaje || 'No se pudo guardar.', 'error')
      });
    } else {
      this.especializacionService.actualizarEspecializacion(payload).subscribe({
        next: (rta) => {
          Swal.fire('Éxito', rta.mensaje || 'Especialización actualizada.', 'success');
          this.closeModal();
          this.listarEspecializaciones();
        },
        error: (err) => Swal.fire('Error', err.error?.mensaje || 'No se pudo actualizar.', 'error')
      });
    }
  }

  showModal(): void {
    const modalEl = document.getElementById('modalCrearEspecializacion');
    if (modalEl) {
      this.modalInstance = new Modal(modalEl);
      this.modalInstance.show();
    }
  }

  closeModal(): void {
    this.modalInstance?.hide();
    this.form.reset();
    this.especializacionSelected = null;
  }
}
