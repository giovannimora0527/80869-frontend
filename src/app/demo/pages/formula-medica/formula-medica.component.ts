import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';
import Swal from 'sweetalert2';
import { FormulaMedicaService } from './service/formula-medica.service';
import { FormulaMedica } from './models/formula-medica';
import { FormulaMedicaRq } from './models/formula-medica-rq';

@Component({
  selector: 'app-formula-medica',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './formula-medica.component.html',
  styleUrl: './formula-medica.component.scss'
})
export class FormulaMedicaComponent {
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  titleModal: string = '';
  titleBoton: string = '';
  lista: FormulaMedica[] = [];
  selected!: FormulaMedica;

  constructor(
    private readonly service: FormulaMedicaService,
    private readonly formBuilder: FormBuilder
  ) {
    this.listar();
    this.inicializarFormulario();
  }

  form: FormGroup = new FormGroup({
    pacienteId: new FormControl(''),
    medicoId: new FormControl(''),
    fecha: new FormControl(''),
    detalles: new FormControl('')
  });

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      pacienteId: ['', [Validators.required]],
      medicoId: ['', [Validators.required]],
      fecha: ['', [Validators.required]],
      detalles: ['', [Validators.required]]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  listar() {
    this.service.listarFormulas().subscribe({
      next: (data) => this.lista = data,
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar las fórmulas', 'error');
      }
    });
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear fórmula médica' : 'Editar fórmula médica';
    this.titleBoton = modo === 'C' ? 'Guardar' : 'Actualizar';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalFormulaMedica');
    if (modalElement) {
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  closeModal() {
    this.modalInstance?.hide();
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const dto: FormulaMedicaRq = this.form.value as FormulaMedicaRq;
    if (this.modoFormulario === 'C') {
      this.service.crearFormula(dto).subscribe({ next: () => { Swal.fire('Ok','Creada','success'); this.closeModal(); this.listar(); }, error: (e)=>{ Swal.fire('Error','No se pudo crear','error'); } });
    } else {
      const payload: FormulaMedicaRq = { ...dto };
      if (this.selected && this.selected.id) payload.id = this.selected.id;
      this.service.actualizarFormula(payload).subscribe({ next: () => { Swal.fire('Ok','Actualizada','success'); this.closeModal(); this.listar(); }, error: () => Swal.fire('Error','No se pudo actualizar','error') });
    }
  }

  abrirCrear() { this.openModal('C'); }
  editar(item: FormulaMedica) { this.selected = item; this.form.patchValue({ pacienteId: (item as any).pacienteId||'', medicoId:(item as any).medicoId||'', fecha:item.fecha, detalles:item.detalles}); this.openModal('E'); }
}
