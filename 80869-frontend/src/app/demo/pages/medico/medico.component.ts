import { Component } from '@angular/core';
import { MedicoService } from './service/medico.service';
import { Medico, MedicoRequest } from './models/medico';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import Modal from 'bootstrap/js/dist/modal';
import { UtilApiService } from 'src/app/services/common/util-api.service';
import { Especializacion } from './models/especializacion';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'app-medico',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './medico.component.html',
  styleUrl: './medico.component.scss'
})
export class MedicoComponent {
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  titleModal: string = '';
  titleBoton: string = '';
  medicoSelected: Medico | null = null;
  medicoList: Medico[] = [];
  especializacionList: Especializacion[] = [];
  form: FormGroup;

  // Propiedades y métodos para la barra de búsqueda
  busquedaMedico: string = '';

  buscarMedicos() {
    const filtro = this.busquedaMedico?.toLowerCase() || '';
    if (!filtro) {
      this.listarMedicos();
      return;
    }
    this.medicoService.listarMedicos().subscribe({
      next: (data) => {
        this.medicoList = data.filter((m: Medico) =>
          m.nombres?.toLowerCase().includes(filtro) ||
          m.apellidos?.toLowerCase().includes(filtro) ||
          m.documento?.toLowerCase().includes(filtro)
        );
      }
    });
  }

  limpiarBusqueda() {
    this.busquedaMedico = '';
    this.listarMedicos();
  }

  constructor(
    private readonly medicoService: MedicoService,
    private readonly utilApiService: UtilApiService,
    private readonly formBuilder: FormBuilder
  ) {
    this.listarMedicos();
    this.listarEspecializaciones();
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      tipoDocumento: ['', [Validators.required]],
      documento: ['', [Validators.required, Validators.maxLength(20), Validators.pattern('^[0-9]+$')]],
      nombres: ['', [Validators.required, Validators.maxLength(100)]],
      apellidos: ['', [Validators.required, Validators.maxLength(100)]],
      telefono: ['', [Validators.maxLength(20), Validators.pattern('^[0-9]*$')]],
      registroProfesional: ['', [Validators.required, Validators.maxLength(50)]],
      especializacionId: [null, [Validators.required]]
    });
  }

  listarEspecializaciones() {
    this.utilApiService.listarEspecializaciones().subscribe({
      next: (data) => {
        this.especializacionList = data;
      }
    });
  }

  listarMedicos() {
    this.medicoService.listarMedicos().subscribe({
      next: (data) => {
        this.medicoList = data;
      }
    });
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Medico' : 'Editar Medico';
    this.titleBoton = modo === 'C' ? 'Guardar Medico' : 'Actualizar Medico';
    this.modoFormulario = modo;
    if (modo === 'C') {
      this.inicializarFormulario();
      this.form.reset();
    }
    this.showModal();
  }

  showModal() {
    const modalElement = document.getElementById('modalCrearMedico');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  abrirNuevoMedico() {
    this.medicoSelected = null;
    this.openModal('C');
  }

  editarModalMedico(medico: Medico) {
    this.medicoSelected = medico;
    this.inicializarFormulario();
    this.form.patchValue({
      tipoDocumento: medico.tipoDocumento,
      documento: medico.documento,
      nombres: medico.nombres,
      apellidos: medico.apellidos,
      telefono: medico.telefono,
      registroProfesional: medico.registroProfesional,
      especializacionId: medico.especializacionId
    });
    this.openModal('E');
  }

  guardarMedico() {
    if (this.form.invalid) {
      const errores: string[] = [];
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control && control.invalid) {
          if (control.hasError('required')) errores.push(`El campo "${key}" es requerido.`);
          if (control.hasError('maxlength')) errores.push(`El campo "${key}" excede la longitud máxima.`);
          if (control.hasError('pattern')) errores.push(`El campo "${key}" tiene un formato inválido.`);
        }
      });
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        html: errores.length ? errores.join('<br>') : 'Por favor, corrige los errores en el formulario.'
      });
      return;
    }

    const formValue = this.form.getRawValue();
    
    // Crear objeto para enviar al backend usando MedicoRequest
    const medicoRq: MedicoRequest = {
      id: this.modoFormulario === 'E' && this.medicoSelected ? this.medicoSelected.id : undefined,
      tipoDocumento: formValue.tipoDocumento,
      documento: formValue.documento,
      nombres: formValue.nombres,
      apellidos: formValue.apellidos,
      telefono: formValue.telefono,
      registroProfesional: formValue.registroProfesional,
      especializacionId: formValue.especializacionId
    };

    console.log('Enviando médico al backend:', medicoRq);
    
    if (this.modoFormulario === 'C') {
      this.medicoService.guardarMedico(medicoRq).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Médico guardado correctamente', 'success');
          this.closeModal();
          this.listarMedicos();
        },
        error: (error) => {
          console.error('Error completo al guardar:', error);
          const mensaje = error.error?.mensaje || error.error?.message || error.message || 'Error desconocido';
          Swal.fire('Error', mensaje, 'error');
        }
      });
    } else {
      this.medicoService.actualizarMedico(medicoRq).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Médico actualizado correctamente', 'success');
          this.closeModal();
          this.listarMedicos();
        },
        error: (error) => {
          console.error('Error completo al actualizar:', error);
          const mensaje = error.error?.mensaje || error.error?.message || error.message || 'Error desconocido';
          Swal.fire('Error', mensaje, 'error');
        }
      });
    }
  }
}