import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Import library module
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
// Importa los objetos necesarios de Bootstrap
import Modal from 'bootstrap/js/dist/modal';

import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Formula } from './models/formula';
import { FormulaService } from './service/formula.service';
import { PacienteService } from '../paciente/service/paciente.service';
import { Paciente } from '../paciente/models/paciente';

@Component({
  selector: 'app-formula',
  imports: [CommonModule, NgxSpinnerModule, FormsModule, ReactiveFormsModule],
  templateUrl: './formula.component.html',
  styleUrl: './formula.component.scss'
})
export class FormulaComponent {
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  formulaList: Formula[] = [];
  formulaListFiltered: Formula[] = [];
  titleModal: string = '';
  titleBoton: string = '';
  formulaSelected: Formula;
  titleSpinner: string = 'Cargando...';
  filtroBusqueda: string = "";

  numeroDocumentoBuscar: string = "";
  pacienteEncontrado: Paciente;

  // Propiedades para el contador de caracteres de indicaciones
  indicaciones: string = '';
  maxCaracteresIndicaciones: number = 500;

  form: FormGroup;

  constructor(
    private readonly formulaService: FormulaService,
    private readonly pacienteService: PacienteService,
    private readonly formBuilder: FormBuilder,
    private readonly spinner: NgxSpinnerService
  ) {
    this.inicializarFormulario();
    this.listarFormulas();
  }

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      citaId: ['', [Validators.required]],
      medicamentoId: ['', [Validators.required]],
      dosis: ['', [Validators.required]],
      indicaciones: ['', [Validators.required]]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.limpiarFormulario();
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Formula' : 'Editar Formula';
    this.titleBoton = modo === 'C' ? 'Guardar Formula' : 'Actualizar Formula';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearFormula');
    if (modalElement) {
      // Verificar si ya existe una instancia del modal
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  limpiarFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.indicaciones = '';
  }

  listarFormulas() {
    this.formulaService.listarFormulas().subscribe({
      next: (data) => {
        this.formulaList = data;
        this.formulaListFiltered = this.formulaList;
      },
      error: (error) => {
        console.error('Error al listar las fórmulas:', error);
      }
    });
  }

  abrirNuevoFormula() {
    this.formulaSelected = null;
    this.openModal('C');
  }

  abrirEditarFormula(formula: Formula) {
    this.formulaSelected = formula;
    this.openModal('E');
  }

  filtrarFormulas(){
    if (this.filtroBusqueda.trim() === '') {
      this.formulaListFiltered = this.formulaList;
    }

    this.formulaListFiltered = this.formulaList.filter((formula) => {
      const busquedaLower = this.filtroBusqueda.toLowerCase();
      const dosisCumple = formula.dosis && formula.dosis.toLowerCase().includes(busquedaLower);

      const indicacionesCumple = formula.indicaciones && formula.indicaciones.toLowerCase().includes(busquedaLower);

      const medicamentoCumple = formula.medicamento.nombre && formula.medicamento.nombre.toLowerCase().includes(busquedaLower);

      const presentacionCumple = formula.medicamento.presentacion && formula.medicamento.presentacion.toLowerCase().includes(busquedaLower);

      const nombresCumple = formula.cita.paciente.nombres && formula.cita.paciente.nombres.toLowerCase().includes(busquedaLower);

      const apellidosCumple = formula.cita.paciente.apellidos && formula.cita.paciente.apellidos.toLowerCase().includes(busquedaLower);

      const fechaCitaCumple = formula.cita.fechaHora && formula.cita.fechaHora.toString().includes(busquedaLower);

      const documentoCumple = formula.cita.paciente.numeroDocumento && formula.cita?.paciente?.numeroDocumento.includes(busquedaLower);

      const tipoDocumentoCumple = formula.cita.paciente.tipoDocumento && formula.cita?.paciente?.tipoDocumento.includes(busquedaLower);

      return (
        dosisCumple ||
        indicacionesCumple ||
        presentacionCumple ||
        nombresCumple ||
        apellidosCumple ||
        fechaCitaCumple ||
        documentoCumple ||
        medicamentoCumple ||
        tipoDocumentoCumple
      );
    });
  }

  onIndicacionesChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    const value = target.value;
    if (value.length <= this.maxCaracteresIndicaciones) {
      this.indicaciones = value;
      this.form.patchValue({ indicaciones: value });
    } else {
      // Truncar el texto si excede el límite
      this.indicaciones = value.substring(0, this.maxCaracteresIndicaciones);
      target.value = this.indicaciones;
      this.form.patchValue({ indicaciones: this.indicaciones });
    }
  }

  getCaracteresRestantes(): number {
    return this.maxCaracteresIndicaciones - this.indicaciones.length;
  }

  buscarPacientePorDocumento() {
    console.log('Número de documento a buscar:', this.numeroDocumentoBuscar);
     this.pacienteService.buscarPacienteXDocumento(this.numeroDocumentoBuscar).subscribe({
       next: (data) => {
         console.log('Paciente encontrado:', data);
         this.pacienteEncontrado = data;
       },
       error: (error) => {
         console.error('Error al buscar el paciente:', error);
         Swal.fire("Advertencia", "Paciente no encontrado", "warning");
       }
     });
  }

  guardarFormula() {
    
  }
}