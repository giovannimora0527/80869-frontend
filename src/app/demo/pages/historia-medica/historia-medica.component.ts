import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';
import Swal from 'sweetalert2';
import { HistoriaMedicaService } from './service/historia-medica.service';
import { HistoriaMedica } from './models/historia-medica';
import { HistoriaMedicaRq } from './models/historia-medica-rq';

@Component({
  selector: 'app-historia-medica',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './historia-medica.component.html',
  styleUrl: './historia-medica.component.scss'
})
export class HistoriaMedicaComponent {
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  titleModal: string = '';
  titleBoton: string = '';
  lista: HistoriaMedica[] = [];
  selected!: HistoriaMedica;

  constructor(private readonly service: HistoriaMedicaService, private readonly formBuilder: FormBuilder) {
    this.listar();
    this.inicializarFormulario();
  }

  form: FormGroup = new FormGroup({
    pacienteId: new FormControl(''),
    fecha: new FormControl(''),
    descripcion: new FormControl('')
  });

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      pacienteId: ['', [Validators.required]],
      fecha: ['', [Validators.required]],
      descripcion: ['', [Validators.required]]
    });
  }

  get f(): { [key: string]: AbstractControl } { return this.form.controls; }

  listar() {
    this.service.listarHistorias().subscribe({ next: (d) => this.lista = d, error: (e)=>{ console.error(e); Swal.fire('Error','No se pudieron cargar las historias','error'); } });
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear historia médica' : 'Editar historia médica';
    this.titleBoton = modo === 'C' ? 'Guardar' : 'Actualizar';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalHistoriaMedica');
    if (modalElement) { this.modalInstance ??= new Modal(modalElement); this.modalInstance.show(); }
  }

  closeModal() { this.modalInstance?.hide(); this.limpiarFormulario(); }
  limpiarFormulario() { this.form.reset(); this.form.markAsPristine(); this.form.markAsUntouched(); }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const dto: HistoriaMedicaRq = this.form.value as HistoriaMedicaRq;
    if (this.modoFormulario === 'C') {
      this.service.crearHistoria(dto).subscribe({ next: ()=>{ Swal.fire('Ok','Creada','success'); this.closeModal(); this.listar(); }, error: ()=>Swal.fire('Error','No se pudo crear','error') });
    } else {
      const payload: HistoriaMedicaRq = { ...dto };
      if (this.selected && this.selected.id) payload.id = this.selected.id;
      this.service.actualizarHistoria(payload).subscribe({ next: ()=>{ Swal.fire('Ok','Actualizada','success'); this.closeModal(); this.listar(); }, error: ()=>Swal.fire('Error','No se pudo actualizar','error') });
    }
  }

  abrirCrear() { this.openModal('C'); }
  editar(item: HistoriaMedica) { this.selected = item; this.form.patchValue({ pacienteId: (item as any).pacienteId||'', fecha:item.fecha, descripcion:item.descripcion }); this.openModal('E'); }
}
