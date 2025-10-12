import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Medicamento } from './models/medicamento.model';
import { MedicamentoService } from './service/medicamento.service';

@Component({
  selector: 'app-medicamento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medicamento.component.html',
  styles: [`:host { display: block; }`]
})
export class MedicamentoComponent implements OnInit {
  // propiedades usadas por la plantilla
  medicamentoList: Medicamento[] = [];
  form: FormGroup;
  titleModal: string = 'Crear Medicamento';
  titleBoton: string = 'Guardar';
  private editingId: number | null = null;

  constructor(private medicamentoService: MedicamentoService, private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      presentacion: [''],
      concentracion: [''],
      stock: [0],
      precio: [0]
    });
  }

  ngOnInit(): void {
    this.cargarMedicamentos();
  }

  cargarMedicamentos(): void {
    this.medicamentoService.getAll().subscribe(data => {
      this.medicamentoList = data;
    });
  }

  abrirMedicamentoModal(): void {
    this.titleModal = 'Crear Medicamento';
    this.titleBoton = 'Guardar';
    this.editingId = null;
    this.form.reset({ nombre: '', descripcion: '', presentacion: '', concentracion: '', stock: 0, precio: 0 });
    this.showBootstrapModal('modalCrearMedicamento');
  }

  editarModalMedicamento(med: Medicamento): void {
    this.titleModal = 'Editar Medicamento';
    this.titleBoton = 'Actualizar';
    this.editingId = med.id ?? null;
    this.form.patchValue({
      nombre: med.nombre ?? '',
      descripcion: med.descripcion ?? '',
      presentacion: med.presentacion ?? '',
      concentracion: (med as any).concentracion ?? '',
      stock: (med as any).stock ?? 0,
      precio: (med as any).precio ?? 0
    });
    this.showBootstrapModal('modalCrearMedicamento');
  }

  guardarMedicamento(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Medicamento = {
      ...this.form.value
    } as Medicamento;

    if (this.editingId != null) {
      // actualizar
      this.medicamentoService.update(this.editingId, payload).subscribe(() => {
        this.cargarMedicamentos();
        this.hideBootstrapModal('modalCrearMedicamento');
      });
    } else {
      // crear
      this.medicamentoService.create(payload).subscribe(() => {
        this.cargarMedicamentos();
        this.hideBootstrapModal('modalCrearMedicamento');
      });
    }
  }

  // helpers para manejar modal Bootstrap (si está presente en el proyecto)
  private showBootstrapModal(id: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bootstrapAny: any = (window as any).bootstrap;
      const el = document.getElementById(id);
      if (bootstrapAny && el) {
        const m = new bootstrapAny.Modal(el);
        m.show();
      }
    } catch (e) {
      // si no está Bootstrap disponible, no romper la app
      console.warn('Bootstrap modal show failed or not present', e);
    }
  }

  private hideBootstrapModal(id: string) {
    try {
      const bootstrapAny: any = (window as any).bootstrap;
      const el = document.getElementById(id);
      if (bootstrapAny && el) {
        const m = bootstrapAny.Modal.getInstance(el);
        if (m) {
          m.hide();
        }
      }
    } catch (e) {
      console.warn('Bootstrap modal hide failed or not present', e);
    }
  }
}
