import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EspecializacionService, EspecializacionRs, EspecializacionRq } from './service/especializacion.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-especializacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './especializacion.component.html',
  styleUrls: ['./especializacion.component.scss']
})
export class EspecializacionComponent {
  especializacionList: EspecializacionRs[] = [];
  especializacionListOriginal: EspecializacionRs[] = [];

  // Modal/UI
  titleModal = '';
  titleBoton = '';
  modoFormulario: 'C' | 'E' | '' = '';
  especializacionSelected: EspecializacionRs | null = null;
  modalInstance: Modal | null = null;

  // Form
  form!: FormGroup;
  guardando = false;

  // Variables para búsqueda
  busquedaNombre: string = '';
  busquedaCodigo: string = '';

  // Variables para estados de carga
  cargandoEspecializaciones = false;

  // Variables para ordenamiento
  ordenActual = {
    campo: '',
    direccion: 'asc'
  };

  constructor(
    private readonly especializacionService: EspecializacionService,
    private readonly fb: FormBuilder
  ) {
    this.inicializarFormulario();
    this.listarEspecializaciones();
  }

  private inicializarFormulario(): void {
    this.form = this.fb.group({
      codigoEspecializacion: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern(/^[A-Z0-9]+$/)
      ]],
      nombre: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],
      descripcion: ['', [
        Validators.maxLength(500)
      ]]
    });
  }

  // Getters para acceso fácil a los controles del formulario
  get codigoEspecializacion() { return this.form.get('codigoEspecializacion'); }
  get nombre() { return this.form.get('nombre'); }
  get descripcion() { return this.form.get('descripcion'); }



  listarEspecializaciones() {
    this.cargandoEspecializaciones = true;
    this.especializacionService.listarEspecializaciones().subscribe({
      next: (data) => {
        this.especializacionListOriginal = data;
        this.especializacionList = [...data];
      },
      error: (error) => {
        console.error('Error fetching especializaciones list:', error);
        Swal.fire('Error', 'No se pudieron cargar las especializaciones.', 'error');
      },
      complete: () => {
        this.cargandoEspecializaciones = false;
      }
    });
  }

  abrirNuevaEspecializacion() {
    this.titleModal = 'Crear Especialización';
    this.titleBoton = 'Guardar Especialización';
    this.modoFormulario = 'C';
    this.especializacionSelected = null;
    this.form.reset();
    this.modoFormulario = 'C';
    this.especializacionSelected = null;

    this.form.reset({
      nombre: null,
      descripcion: null,
      codigoEspecializacion: null
    });

    this.abrirModal();
  }

  editarModalEspecializacion(especializacion: EspecializacionRs) {
    this.titleModal = 'Editar Especialización';
    this.titleBoton = 'Actualizar Especialización';
    this.modoFormulario = 'E';
    this.especializacionSelected = especializacion;

    this.form.reset({
      nombre: especializacion.nombre,
      descripcion: especializacion.descripcion,
      codigoEspecializacion: especializacion.codigoEspecializacion
    });

    this.abrirModal();
  }

  abrirModal() {
    const el = document.getElementById('modalCrearEspecializacion');
    if (!el) return;
    this.modalInstance ??= new Modal(el);
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  guardarEspecializacion() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire('Error', 'Por favor, corrige los errores en el formulario.', 'error');
      return;
    }

    this.guardando = true;

    const body: EspecializacionRq = {
      nombre: this.form.getRawValue().nombre.trim(),
      descripcion: this.form.getRawValue().descripcion?.trim() || '',
      codigoEspecializacion: this.form.getRawValue().codigoEspecializacion.trim()
    };

    if (this.modoFormulario === 'E' && this.especializacionSelected) {
      body.id = this.especializacionSelected.id;
    }

    this.especializacionService.guardarEspecializacion(body).subscribe({
      next: (r) => {
        Swal.fire('Éxito', r?.mensaje || 'La especialización se ha guardado correctamente.', 'success');
        this.closeModal();
        this.listarEspecializaciones();
      },
      error: (e) => {
        console.error(e);
        const msg = e?.error?.message || e?.error || 'Error guardando la especialización.';
        Swal.fire('Error', msg, 'error');
      },
      complete: () => {
        this.guardando = false;
      }
    });
  }

  /**
   * Métodos para búsqueda
   */
  buscarEspecializaciones() {
    let listaFiltrada = [...this.especializacionListOriginal];

    if (this.busquedaNombre && this.busquedaNombre.trim() !== '') {
      const nombreBusqueda = this.busquedaNombre.toLowerCase().trim();
      listaFiltrada = listaFiltrada.filter(especializacion => 
        especializacion.nombre.toLowerCase().includes(nombreBusqueda)
      );
    }

    if (this.busquedaCodigo && this.busquedaCodigo.trim() !== '') {
      const codigoBusqueda = this.busquedaCodigo.toLowerCase().trim();
      listaFiltrada = listaFiltrada.filter(especializacion => 
        especializacion.codigoEspecializacion.toLowerCase().includes(codigoBusqueda)
      );
    }

    this.especializacionList = listaFiltrada;
  }

  limpiarBusqueda() {
    this.busquedaNombre = '';
    this.busquedaCodigo = '';
    this.especializacionList = [...this.especializacionListOriginal];
  }

  /**
   * Métodos para ordenamiento
   */
  ordenarPor(campo: string) {
    if (this.ordenActual.campo === campo) {
      this.ordenActual.direccion = this.ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenActual.campo = campo;
      this.ordenActual.direccion = 'asc';
    }

    this.especializacionList.sort((a: any, b: any) => {
      let valorA = a[campo];
      let valorB = b[campo];

      if (valorA == null) valorA = '';
      if (valorB == null) valorB = '';

      if (campo === 'id') {
        valorA = Number(valorA);
        valorB = Number(valorB);
      } else {
        valorA = valorA.toString().toLowerCase();
        valorB = valorB.toString().toLowerCase();
      }

      let resultado = 0;
      if (valorA < valorB) {
        resultado = -1;
      } else if (valorA > valorB) {
        resultado = 1;
      }

      if (campo === 'id') {
        return this.ordenActual.direccion === 'asc' ? -resultado : resultado;
      } else {
        return this.ordenActual.direccion === 'asc' ? resultado : -resultado;
      }
    });
  }

  getIconoOrden(campo: string): string {
    if (this.ordenActual.campo !== campo) {
      return 'fa fa-sort';
    }
    return this.ordenActual.direccion === 'asc' ? 'fa fa-sort-up' : 'fa fa-sort-down';
  }
}