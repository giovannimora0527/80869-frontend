import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventarioMedicamentoService } from './service/inventario-medicamento.service';
import { InventarioMedicamento, InventarioMedicamentoRq, Medicamento } from './models/inventario-medicamento';
import Swal from 'sweetalert2';
import Modal from 'bootstrap/js/dist/modal';

@Component({
  selector: 'app-inventario-medicamento',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventario-medicamento.component.html',
  styleUrls: ['./inventario-medicamento.component.scss']
})
export class InventarioMedicamentoComponent implements OnInit {
  inventario: InventarioMedicamento[] = [];
  isLoading = false;
  search = '';
  modalInstance?: Modal;
  modoFormulario: 'C' | 'E' = 'C';
  titleModal = '';
  titleBoton = '';
  form: FormGroup;
  selectedInventario: InventarioMedicamento | null = null;

  constructor(
    private readonly service: InventarioMedicamentoService,
    private readonly fb: FormBuilder
  ) {
    this.form = this.fb.group({
      id: [null],
      cantidad: [null, [Validators.required, Validators.min(1)]],
      fechaIngreso: [null, [Validators.required]],
      fechaVencimiento: [null],
      lote: [''],
      medicamentoId: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.listarInventario();
  }

  listarInventario(): void {
    this.isLoading = true;
    this.service.listarInventario().subscribe({
      next: (data) => {
        this.inventario = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('Error', 'No se pudo cargar el inventario.', 'error');
      }
    });
  }

  abrirModalCrear(): void {
    this.form.reset();
    this.modoFormulario = 'C';
    this.titleModal = 'Registrar Medicamento';
    this.titleBoton = 'Guardar';
    this.selectedInventario = null;
    this.showModal();
  }

  abrirModalEditar(item: InventarioMedicamento): void {
    this.form.patchValue({
      id: item.id,
      cantidad: item.cantidad,
      fechaIngreso: item.fechaIngreso,
      fechaVencimiento: item.fechaVencimiento,
      lote: item.lote,
      medicamentoId: item.medicamento.id
    });
    this.modoFormulario = 'E';
    this.titleModal = 'Editar Medicamento';
    this.titleBoton = 'Actualizar';
    this.selectedInventario = item;
    this.showModal();
  }

  guardarInventario(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Formatear fechas y asegurar medicamentoId válido
    const raw = this.form.value;
    // Si no hay fechaIngreso, usar hoy
    let fechaIngreso = raw.fechaIngreso;
    if (!fechaIngreso) {
      const hoy = new Date();
      const year = hoy.getFullYear();
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const day = String(hoy.getDate()).padStart(2, '0');
      fechaIngreso = `${year}-${month}-${day}`;
    } else {
      fechaIngreso = this.formatDate(fechaIngreso);
    }
    const rq: InventarioMedicamentoRq = {
      cantidad: raw.cantidad,
      fechaIngreso: fechaIngreso,
      fechaVencimiento: raw.fechaVencimiento ? this.formatDate(raw.fechaVencimiento) : '',
      lote: raw.lote,
      medicamentoId: Number(raw.medicamentoId)
    };
    this.isLoading = true;
    if (this.modoFormulario === 'C') {
      this.service.guardarInventario(rq).subscribe({
        next: (rta) => {
          Swal.fire('Éxito', rta.mensaje, 'success');
          this.closeModal();
          this.listarInventario();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.mensaje || 'No se pudo guardar.', 'error');
          this.isLoading = false;
        }
      });
    } else {
      this.service.actualizarInventario(this.form.value.id, rq).subscribe({
        next: (rta) => {
          Swal.fire('Éxito', rta.mensaje, 'success');
          this.closeModal();
          this.listarInventario();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.mensaje || 'No se pudo actualizar.', 'error');
          this.isLoading = false;
        }
      });
    }
  }

  // Formatea fecha a yyyy-MM-dd
  formatDate(date: any): string {
    if (!date) return '';
    
      // Si ya es string en formato yyyy-MM-dd, devolverlo tal cual
      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
    
      // Convertir a Date y formatear
    const d = new Date(date);
    
      // Validar que sea una fecha válida
      if (isNaN(d.getTime())) {
        console.error('Fecha inválida:', date);
        return '';
      }
    
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  showModal(): void {
    const modalElement = document.getElementById('modalInventarioMedicamento');
    if (modalElement) {
      this.modalInstance = new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  closeModal(): void {
    this.modalInstance?.hide();
    this.form.reset();
    this.selectedInventario = null;
    this.isLoading = false;
  }

  get inventarioFiltrado(): InventarioMedicamento[] {
    if (!this.search) return this.inventario || [];
    return (this.inventario || []).filter(item =>
      (item.medicamento?.nombre?.toLowerCase() || '').includes(this.search.toLowerCase()) ||
      (item.lote?.toLowerCase() || '').includes(this.search.toLowerCase())
    );
  }
}
