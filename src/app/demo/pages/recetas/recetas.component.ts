import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';

// Reemplazar estas rutas según la estructura de tu proyecto
import { RecetasService } from './service/recetas.service';
import { Recetas} from './models/recetas';
// Importaciones opcionales para listas secundarias (Cita, Medicamento)
// import { UtilApiService } from 'src/app/services/common/util-api.service'; 


@Component({
  selector: 'app-receta',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recetas.component.html',
  styleUrl: './recetas.component.scss',
  standalone: true
})
export class RecetasComponent implements OnInit {
  
  // PROPIEDADES DE ESTADO Y UI (Estructura de MedicoComponent)
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  titleModal: string = '';
  titleBoton: string = '';

  // Datos principales
  recetaList: Recetas[] = [];
  recetaSelected!: Recetas;
  isLoading: boolean = false;

  // Formulario de Receta
  form: FormGroup = new FormGroup({
    cita: new FormControl(''),
    medicamento: new FormControl(''),
    dosis: new FormControl(''),
    indicaciones: new FormControl('')
  });

  constructor(
    private readonly recetaService: RecetasService,
    // private readonly utilApiService: UtilApiService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.listarRecetas();
  }
  
  /**
   * Proporciona acceso 'f' a los controles del formulario. (ESTRUCTURA DE MÉDICO)
   */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  /**
   * Inicialización del formulario (ESTRUCTURA DE MÉDICO).
   */
  inicializarFormulario() {
    this.form = this.formBuilder.group({
      cita: [null, [Validators.required]],        // Asumimos objeto o ID de Cita
      medicamento: [null, [Validators.required]], // Asumimos objeto o ID de Medicamento
      dosis: ['', [Validators.required, Validators.maxLength(100)]],
      indicaciones: ['', [Validators.maxLength(500)]]
    });
  }

  /**
   * Carga la lista de recetas desde el backend.
   */
  listarRecetas() {
    this.isLoading = true;
    this.recetaService.listarRecetas().subscribe({
      next: (data) => {
        this.recetaList = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching recetas:', error);
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar las recetas.', 'error');
      }
    });
  }

  // --- PLACEHOLDERS DE ACCIONES DEL MÉDICO ---
  openModal(modo: string) { /* Lógica de modal no implementada */ }
  closeModal() { /* Lógica de modal no implementada */ }
  
  limpiarFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
  
  guardarReceta() { Swal.fire('Guardando Receta', 'Función pendiente.', 'info'); }
  abrirRecetaModal() { this.openModal('C'); }
  editarModalReceta(receta: Recetas) { this.recetaSelected = receta; this.openModal('E'); }
}