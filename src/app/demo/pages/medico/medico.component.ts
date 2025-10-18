import { Component } from '@angular/core';
import { MedicoService } from './service/medico.service';
import { Medico } from './models/medico';
import { CommonModule } from '@angular/common';

import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

import Swal from 'sweetalert2';
import { UtilApiService } from 'src/app/services/common/util-api.service';
import { Especializacion } from './models/especializacion';

import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';

@Component({
  selector: 'app-medico',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './medico.component.html',
  styleUrl: './medico.component.scss'
})
export class MedicoComponent {
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  titleModal: string = '';
  titleBoton: string = '';
  medicoList: Medico[] = [];
  especializacionesList: Especializacion[] = [];
  medicoSelected: Medico;
  msjSpinner: string = 'Probando spinner ....';

  constructor(
    private readonly medicoService: MedicoService,
    private readonly utilApiService: UtilApiService,
    private readonly formBuilder: FormBuilder,
    private readonly spinner: NgxSpinnerService
  ) {
    this.listarMedicos();
    this.inicializarFormulario();
    this.cargarEspecializaciones();
  }

  /**
   * Formulario para crear/editar usuario.
   */
  form: FormGroup = new FormGroup({
    tipoDocumento: new FormControl(''),
    numeroDocumento: new FormControl(''),
    nombres: new FormControl(''),
    apellidos: new FormControl(''),
    telefono: new FormControl(''),
    registroProfesional: new FormControl(''),
    especializacion: new FormControl('')
  });

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      tipoDocumento: ['', [Validators.required]],
      numeroDocumento: ['', [Validators.required, Validators.minLength(8)]],
      nombres: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      registroProfesional: ['', [Validators.required]],
      especializacion: ['', [Validators.required]]
    });
  }

  /**
   * Siempre va igual.
   */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  cargarEspecializaciones() {
    this.utilApiService.listarEspecialidades('especializacion').subscribe({
      next: (data) => {
        this.especializacionesList = data;
      },
      error: (error) => {
        console.log(error);
        Swal.fire('Error', 'No se pudieron cargar las especializaciones.', 'error');
      }
    });
  }

  listarMedicos() {
    this.spinner.show();
    this.medicoService.listarMedicos().subscribe({
      next: (data) => {
        this.spinner.hide();
        this.medicoList = data;
      },
      error: (error) => {
        this.spinner.hide();
        console.error('Error fetching medicos:', error);
      }
    });
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear médico' : 'Editar médico';
    this.titleBoton = modo === 'C' ? 'Guardar médico' : 'Actualizar médico';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearMedico');
    if (modalElement) {
      // Verificar si ya existe una instancia del modal
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

  guardarMedico() {
    this.msjSpinner = this.modoFormulario === 'C' ? 'Creando usuario ...' : 'Actualizando usuario ...';
    this.spinner.show();
    if (this.form.invalid) {
      this.spinner.hide();
      Swal.fire('Error', 'Por favor, corrija los errores en el formulario.', 'error');
    }
    if (this.modoFormulario === 'C') {
      // Creacion
      this.medicoService.guardarMedico(this.form.value).subscribe({
        next: (data) => {
          this.spinner.hide();
          Swal.fire('Éxito', data.mensaje, 'success');
          this.listarMedicos();
          this.closeModal();
        },
        error: (error) => {
          this.spinner.hide();
          Swal.fire('Error', error.error.message, 'error');
        }
      });
    } else {
      const medicoActualizar = { ...this.medicoSelected, ...this.form.value };
      // Edicion o actualizar
       this.medicoService.actualizarMedico(medicoActualizar).subscribe({
        next: (data) => {
          this.spinner.hide();
          Swal.fire('Éxito', data.mensaje, 'success');
          this.listarMedicos();
          this.closeModal();
        },
        error: (error) => {
          this.spinner.hide();
          Swal.fire('Error', error.error.message, 'error');
        }
      });
    }
  }

  abrirMedicoModal() {
    this.openModal('C');
  }

  editarModalMedico(medico: Medico) {
    this.medicoSelected = medico;
    this.openModal('E');
  }
}
