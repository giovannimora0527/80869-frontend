import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecetasService, RecetaRs, RecetaRq, Cita, Medicamento } from './service/recetas.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './recetas.component.html',
  styleUrls: ['./recetas.component.scss']
})
export class RecetasComponent implements OnDestroy {
  recetasList: RecetaRs[] = [];
  recetasListOriginal: RecetaRs[] = []; // Lista original sin filtrar
  citasList: Cita[] = [];
  medicamentosList: Medicamento[] = [];

  // Modal/UI
  titleModal = '';
  titleBoton = '';
  recetaSelected: RecetaRs | null = null;
  modalInstance: Modal | null = null;

  // Form
  form!: FormGroup;
  guardando = false;

  // Variables para búsqueda
  busquedaPaciente: string = '';
  busquedaMedicamento: string = '';
  busquedaCitaId: string = '';

  // Variables para estados de carga
  cargandoRecetas = false;
  cargandoCitas = false;
  cargandoMedicamentos = false;

  // Variables para ordenamiento
  ordenActual = {
    campo: '',
    direccion: 'asc' // 'asc' o 'desc'
  };

  // Actualización automática
  private intervalId: any;

  constructor(
    private readonly recetasService: RecetasService,
    private readonly fb: FormBuilder
  ) {
    this.crearFormularioVacio();
    this.listarRecetas();
    this.cargarCitas();
    this.cargarMedicamentos();
    this.iniciarActualizacionAutomatica();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  /**
   * Inicia la actualización automática de citas cada 10 minutos
   */
  private iniciarActualizacionAutomatica() {
    // Actualizar citas cada 10 minutos (600000 ms)
    this.intervalId = setInterval(() => {
      this.cargarCitas();
    }, 600000);
  }

  private crearFormularioVacio() {
    this.form = this.fb.group({
      citaId: [null, Validators.required],
      medicamentoId: [null, Validators.required],
      dosis: ['', [
        Validators.required,
        Validators.maxLength(200)
      ]],
      indicaciones: ['', Validators.maxLength(500)]
    });
  }

  // Getters para fácil acceso a los controles del formulario
  get citaId() {
    return this.form.get('citaId');
  }

  get medicamentoId() {
    return this.form.get('medicamentoId');
  }

  get dosis() {
    return this.form.get('dosis');
  }

  get indicaciones() {
    return this.form.get('indicaciones');
  }

  listarRecetas() {
    this.cargandoRecetas = true;
    this.recetasService.listarRecetas().subscribe({
      next: (data) => {
        this.recetasListOriginal = data;
        this.recetasList = [...data];
      },
      error: (error) => {
        console.error('Error fetching recetas list:', error);
        Swal.fire('Error', 'No se pudieron cargar las recetas.', 'error');
      },
      complete: () => {
        this.cargandoRecetas = false;
      }
    });
  }

  cargarCitas() {
    this.cargandoCitas = true;
    // Usar el nuevo método que filtra las citas disponibles para recetas
    this.recetasService.listarCitasDisponiblesParaRecetas().subscribe({
      next: (data) => {
        // Mapea los datos del backend al formato esperado por el frontend
        this.citasList = data.map(cita => ({
          id: cita.id,
          fechaHora: cita.fechaHora,
          estado: cita.estado,
          pacienteNombre: cita.nombreCompletoPaciente 
        })) as Cita[];
        
        console.log('Citas disponibles para recetas:', this.citasList);
      },
      error: (error) => {
        console.error('Error fetching citas list:', error);
        Swal.fire('Error', 'No se pudieron cargar las citas disponibles.', 'error');
      },
      complete: () => {
        this.cargandoCitas = false;
      }
    });
  }

 cargarMedicamentos() {
  this.cargandoMedicamentos = true;
  this.recetasService.listarMedicamentos().subscribe({
    next: (data) => {
      console.log('Medicamentos cargados:', data); 
      this.medicamentosList = data;
    },
    error: (error) => {
      console.error('Error fetching medicamentos list:', error);
      Swal.fire('Error', 'No se pudieron cargar los medicamentos.', 'error');
    },
    complete: () => {
      this.cargandoMedicamentos = false;
    }
    });
  }

  abrirNuevaReceta() {
    this.titleModal = 'Crear Receta';
    this.titleBoton = 'Guardar Receta';
    this.recetaSelected = null;

    this.form.reset({
      citaId: null,
      medicamentoId: null,
      dosis: '',
      indicaciones: ''
    });

    this.form.get('citaId')?.enable();

    this.abrirModal();
  }

  editarModalReceta(receta: RecetaRs) {
    this.titleModal = 'Editar Receta';
    this.titleBoton = 'Actualizar Receta';
    this.recetaSelected = receta;

    this.form.reset({
      citaId: receta.citaId,
      medicamentoId: receta.medicamentoId,
      dosis: receta.dosis,
      indicaciones: receta.indicaciones || ''
    });
    this.form.get('citaId')?.disable();
    this.abrirModal();
  }

  abrirModal() {
    const el = document.getElementById('modalCrearReceta');
    if (!el) return;
    this.modalInstance ??= new Modal(el);
    this.modalInstance.show();
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  guardarReceta() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire('Error', 'Por favor, corrige los errores en el formulario.', 'error');
      return;
    }

    this.guardando = true;

    const body: RecetaRq = {
      citaId: Number(this.form.getRawValue().citaId),
      medicamentoId: Number(this.form.getRawValue().medicamentoId),
      dosis: this.form.getRawValue().dosis.trim(),
      indicaciones: this.form.getRawValue().indicaciones?.trim() || undefined
    };

    this.recetasService.guardarReceta(body).subscribe({
      next: (r) => {
        Swal.fire('Éxito', r?.mensaje || 'La receta se ha guardado correctamente.', 'success');
        this.closeModal();
        this.listarRecetas(); 
        // Actualizar la lista de citas disponibles después de crear una receta
        this.cargarCitas();
      },
      error: (e) => {
        console.error(e);
        const msg = e?.error?.message || e?.error || 'Error guardando la receta.';
        Swal.fire('Error', msg, 'error');
      },
      complete: () => {
        this.guardando = false;
      }
    });
  }

  /**
   * Métodos para búsqueda de recetas
   */
  buscarRecetas() {
    let listaFiltrada = [...this.recetasListOriginal];

    // Filtrar por ID de cita
    if (this.busquedaCitaId && this.busquedaCitaId.trim() !== '') {
      const citaIdBusqueda = this.busquedaCitaId.trim();
      listaFiltrada = listaFiltrada.filter(receta => 
        receta.citaId.toString().includes(citaIdBusqueda)
      );
    }

    // Filtrar por medicamento
    if (this.busquedaMedicamento && this.busquedaMedicamento.trim() !== '') {
      const medicamentoBusqueda = this.busquedaMedicamento.toLowerCase().trim();
      listaFiltrada = listaFiltrada.filter(receta => 
        receta.nombreMedicamento.toLowerCase().includes(medicamentoBusqueda)
      );
    }

    this.recetasList = listaFiltrada;
  }

  limpiarBusqueda() {
    this.busquedaPaciente = '';
    this.busquedaMedicamento = '';
    this.busquedaCitaId = '';
    this.recetasList = [...this.recetasListOriginal];
  }

  /**
   * Métodos para ordenamiento
   */
  ordenarPor(campo: string) {
    // Si es el mismo campo, cambiar dirección, si no, ordenar ascendente
    if (this.ordenActual.campo === campo) {
      this.ordenActual.direccion = this.ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenActual.campo = campo;
      this.ordenActual.direccion = 'asc';
    }

    this.recetasList.sort((a: any, b: any) => {
      let valorA = a[campo];
      let valorB = b[campo];

      // Manejar valores null/undefined
      if (valorA == null) valorA = '';
      if (valorB == null) valorB = '';

      // Si son números, convertir a número
      if (campo === 'id' || campo === 'citaId' || campo === 'medicamentoId') {
        valorA = Number(valorA);
        valorB = Number(valorB);
      } else {
        // Para strings, convertir a minúsculas para comparación
        valorA = valorA.toString().toLowerCase();
        valorB = valorB.toString().toLowerCase();
      }

      let resultado = 0;
      if (valorA < valorB) {
        resultado = -1;
      } else if (valorA > valorB) {
        resultado = 1;
      }

      // Para números (como ID), ordenar de mayor a menor por defecto
      if (campo === 'id' || campo === 'citaId' || campo === 'medicamentoId') {
        return this.ordenActual.direccion === 'asc' ? -resultado : resultado;
      } else {
        // Para texto, ordenar de A a Z por defecto
        return this.ordenActual.direccion === 'asc' ? resultado : -resultado;
      }
    });
  }

  getIconoOrden(campo: string): string {
    if (this.ordenActual.campo !== campo) {
      return 'fa fa-sort'; // Icono neutro
    }
    return this.ordenActual.direccion === 'asc' ? 'fa fa-sort-up' : 'fa fa-sort-down';
  }
}