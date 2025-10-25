import { Component } from '@angular/core';
import { RecetaService } from './service/formula.service';
import { Receta } from './models/formula';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import Modal from 'bootstrap/js/dist/modal';
import { UtilApiService } from 'src/app/services/common/util-api.service';
import { Cita } from 'src/app/demo/pages/cita/models/cita';
import { Medicamento } from 'src/app/demo/pages/medicamento/models/medicamento';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formula',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './formula.component.html',
  styleUrl: './formula.component.scss'
})
export class FormulaComponent {
  /**
   * Variables para el modal
   */
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  titleModal: string = '';
  titleBoton: string = '';
  recetaSelected: Receta | null = null;
  titleSpinner: string = 'Cargando...';

  /**
   * Variables para la tabla de datos
   */
  recetaList: Receta[] = [];
  citaList: Cita[] = [];
  medicamentoList: Medicamento[] = [];

  /**
   * Formulario reactivo
   */
  form: FormGroup;

  constructor(
    private readonly recetaService: RecetaService,
    private readonly formBuilder: FormBuilder,
    private readonly utilApiService: UtilApiService,
    private readonly spinner: NgxSpinnerService
  ) {
    this.inicializarFormulario();
    this.cargarDatosIniciales();
  }

  /**
   * Inicializa el formulario con validaciones
   */
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      dosis: ['', [Validators.required, Validators.minLength(3)]],
      indicaciones: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      citaId: [null, [Validators.required]],
      medicamentoId: [null, [Validators.required]]
    });
  }

  /**
   * Carga los datos iniciales
   */
  cargarDatosIniciales() {
    this.titleSpinner = 'Cargando datos...';
    this.spinner.show();

    // Cargar todo en paralelo
    Promise.all([
      this.listarRecetas(),
      this.listarCitas(),
      this.listarMedicamentos()
    ]).finally(() => {
      this.spinner.hide();
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /**
   * Lista todas las recetas
   */
  listarRecetas(): Promise<void> {
    return new Promise((resolve) => {
      this.recetaService.listarRecetas().subscribe({
        next: (data) => {
          this.recetaList = data;
          console.log('Recetas cargadas:', this.recetaList);
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar recetas:', error);
          resolve();
        }
      });
    });
  }

  /**
   * Lista todas las citas
   */
  listarCitas(): Promise<void> {
    return new Promise((resolve) => {
      this.utilApiService.listarCitas().subscribe({
        next: (data) => {
          this.citaList = data;
          console.log('Citas cargadas:', this.citaList);
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar citas:', error);
          resolve();
        }
      });
    });
  }

  /**
   * Lista todos los medicamentos
   */
  listarMedicamentos(): Promise<void> {
    return new Promise((resolve) => {
      this.utilApiService.listarMedicamentos().subscribe({
        next: (data) => {
          this.medicamentoList = data;
          console.log('Medicamentos cargados:', this.medicamentoList);
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar medicamentos:', error);
          resolve();
        }
      });
    });
  }

  /**
   * Abre el modal en modo creación
   */
  abrirNuevoReceta() {
    this.recetaSelected = null;
    this.limpiarFormulario();
    this.openModal('C');
  }

  /**
   * Abre el modal en modo edición
   */
  editarModalReceta(receta: Receta) {
    this.recetaSelected = receta;
    this.cargarDatosFormulario(receta);
    this.openModal('E');
  }

  /**
   * Carga los datos de la receta en el formulario
   */
  cargarDatosFormulario(receta: Receta) {
    this.form.patchValue({
      dosis: receta.dosis,
      indicaciones: receta.indicaciones,
      citaId: receta.cita?.id || null,
      medicamentoId: receta.medicamento?.id || null
    });
  }

  /**
   * Abre el modal
   */
  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Fórmula Médica' : 'Editar Fórmula Médica';
    this.titleBoton = modo === 'C' ? 'Guardar Fórmula' : 'Actualizar Fórmula';
    this.modoFormulario = modo;

    const modalElement = document.getElementById('modalCrearReceta');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  /**
   * Cierra el modal
   */
  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.limpiarFormulario();
  }

  /**
   * Guarda o actualiza una receta
   */
  guardarReceta() {
    // Validar formulario
    if (this.form.invalid) {
      console.log('Formulario inválido:', this.form);
      console.log('Errores por campo:');
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.log(`- ${key}:`, control.errors);
        }
      });

      Swal.fire('Error', 'Por favor, complete todos los campos correctamente.', 'error');
      this.form.markAllAsTouched();
      return;
    }

    this.titleSpinner = this.modoFormulario === 'C' ? 'Creando fórmula...' : 'Actualizando fórmula...';
    this.spinner.show();

    const recetaData = {
      ...this.form.getRawValue(),
      id: this.recetaSelected?.id || 0
    };

    console.log('Datos a enviar:', recetaData);

    if (this.modoFormulario === 'C') {
      // Modo Creación
      this.recetaService.guardarReceta(recetaData).subscribe({
        next: (data) => {
          this.spinner.hide();
          if (data.status === 200) {
            Swal.fire('Éxito', data.mensaje, 'success');
            this.closeModal();
            this.listarRecetas();
          } else {
            Swal.fire('Error', data.mensaje, 'error');
          }
        },
        error: (error) => {
          this.spinner.hide();
          console.error('Error al guardar:', error);
          Swal.fire('Error', error.error?.message || 'No se pudo guardar la fórmula', 'error');
        }
      });
    } else {
      // Modo Edición
      this.recetaService.actualizarReceta(recetaData).subscribe({
        next: (data) => {
          this.spinner.hide();
          if (data.status === 200) {
            Swal.fire('Éxito', data.mensaje, 'success');
            this.closeModal();
            this.listarRecetas();
          } else {
            Swal.fire('Error', data.mensaje, 'error');
          }
        },
        error: (error) => {
          this.spinner.hide();
          console.error('Error al actualizar:', error);
          Swal.fire('Error', error.error?.message || 'No se pudo actualizar la fórmula', 'error');
        }
      });
    }
  }

  /**
   * Limpia el formulario
   */
  limpiarFormulario() {
    this.form.reset({
      dosis: '',
      indicaciones: '',
      citaId: null,
      medicamentoId: null
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}
