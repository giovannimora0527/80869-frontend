import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';

// CORREGIDO: Usar Receta
import { RecetasService } from './service/recetas.service';
import { Receta } from './models/recetas';

@Component({
  selector: 'app-receta',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recetas.component.html',
  styleUrls: ['./recetas.component.scss'],
  standalone: true
})
export class RecetasComponent implements OnInit {
  
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  titleModal: string = '';
  titleBoton: string = '';

  recetaList: Receta[] = []; 
  recetaSelected!: Receta | null;
  isLoading: boolean = false;


  form: FormGroup = new FormGroup({
    id: new FormControl(null), 
    citaId: new FormControl(''),
    medicamentoId: new FormControl(''),
    dosis: new FormControl(''),
    indicaciones: new FormControl('')
  });

  constructor(
    private readonly recetaService: RecetasService,
    private readonly formBuilder: FormBuilder
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.listarRecetas();
  }
  
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      id: [null],
      citaId: [null, [Validators.required]],        
      medicamentoId: [null, [Validators.required]], 
      dosis: ['', [Validators.required, Validators.maxLength(100)]],
      indicaciones: ['', [Validators.maxLength(500)]]
    });
  }

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

  openModal(modo: string) {
    this.modoFormulario = modo;
    this.titleModal = modo === 'C' ? 'Crear Nueva Receta' : 'Editar Receta';
    this.titleBoton = modo === 'C' ? 'Guardar' : 'Actualizar';
    const modalElement = document.getElementById('modalRecetas');
    if (modalElement) {
      this.modalInstance = new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  closeModal() {
    this.modalInstance?.hide();
    this.limpiarFormulario();
    this.recetaSelected = null;
  }
  
  limpiarFormulario() {
    this.form.reset({
        id: null,
        citaId: null,
        medicamentoId: null,
        dosis: '',
        indicaciones: ''
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
  
  guardarReceta() {
    if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
    }

    const recetaData: Receta = this.form.value;

    if (this.modoFormulario === 'C') {
        this.recetaService.guardarReceta(recetaData).subscribe({
            next: (rta) => {
                Swal.fire('Éxito', rta.mensaje, 'success');
                this.closeModal();
                this.listarRecetas();
            },
            error: (err) => {
                console.error(err);
                Swal.fire('Error', err.error?.mensaje || 'No se pudo guardar la receta.', 'error');
            }
        });
    } else if (this.modoFormulario === 'E') {
        this.recetaService.actualizarReceta(recetaData).subscribe({
            next: (rta) => {
                Swal.fire('Éxito', rta.mensaje, 'success');
                this.closeModal();
                this.listarRecetas();
            },
            error: (err) => {
                console.error(err);
                Swal.fire('Error', err.error?.mensaje || 'No se pudo actualizar la receta.', 'error');
            }
        });
    }
  }
  
  abrirRecetaModal() { 
    this.limpiarFormulario();
    this.openModal('C'); 
  }

  editarModalReceta(receta: Receta) { 
    this.recetaSelected = receta; 
    
    this.form.patchValue({
      id: receta.id,
      citaId: receta.citaId, 
      medicamentoId: receta.medicamentoId,
      dosis: receta.dosis,
      indicaciones: receta.indicaciones,
    });
    this.openModal('E'); 
  }
}