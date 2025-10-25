import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitasService, CitaRs, CitaRq } from './service/citas.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.scss']
})
export class CitasComponent {
  citasList: CitaRs[] = [];

  // modal/ui
  titleModal = '';
  titleBoton = '';
  modoFormulario: 'C' | 'E' | '' = '';
  citaSelected: CitaRs | null = null;
  modalInstance: Modal | null = null;

  // form
  form!: FormGroup;
  guardando = false;

  constructor(
    private readonly citasService: CitasService,
    private readonly fb: FormBuilder
  ) {
    this.crearFormularioVacio();
    this.listarCitas();
  }

  private crearFormularioVacio() {
    this.form = this.fb.group({
      pacienteId: [null, Validators.required],
      medicoId:   [null, Validators.required],
      fechaHora:  [null, Validators.required],
      estado:     ['PENDIENTE', Validators.required],
      motivo:     ['']
    });
  }

listarCitas() {
  this.citasService.listarCitas().subscribe({
    next: (data) => this.citasList = data,
    error: (error) => console.error('Error fetching citas list:', error)
  });
}

  abrirNuevaCita() {
    this.titleModal = 'Crear Cita';
    this.titleBoton = 'Guardar Cita';
    this.modoFormulario = 'C';
    this.citaSelected = null;

    this.form.reset({
      pacienteId: null,
      medicoId: null,
      fechaHora: null,
      estado: 'PENDIENTE',
      motivo: ''
    });
    this.form.get('pacienteId')?.enable();
    this.abrirModal();
  }

  editarModalCita(cita: CitaRs) {
    this.titleModal = 'Editar Cita';
    this.titleBoton = 'Actualizar Cita';
    this.modoFormulario = 'E';
    this.citaSelected = cita;

    this.form.patchValue({
      pacienteId: cita.pacienteId,
      medicoId: cita.medicoId,
      fechaHora: cita.fechaHora,
      estado: cita.estado,
      motivo: cita.motivo,
    });
    this.form.get('pacienteId')?.disable();
    this.abrirModal();
  }

  abrirModal() {
    const el = document.getElementById('modalCrearCita');
    if (!el) return;
    this.modalInstance ??= new Modal(el);
    this.modalInstance.show();

    el.addEventListener('hidden.bs.modal', () => {
      this.form.markAsPristine();
      this.form.markAsUntouched();
    }, { once: true });
  }

  closeModal() {
    this.modalInstance?.hide();
  }

  guardarCita() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire('Error', 'Por favor, corrige los errores en el formulario.', 'error');
      this.guardando = false; 
      return;
    }

    const fechaMin = this.form.value.fechaHora as string;
    const fechaConSeg = fechaMin?.length === 16 ? `${fechaMin}:00` : fechaMin;

    // Validar que la fecha y hora no sean anteriores a la actual
    const fechaActual = new Date();
    const fechaCita = new Date(fechaConSeg);

    if (fechaCita < fechaActual) {
      Swal.fire('Error', 'No se pueden asignar citas con fecha y hora anteriores a la actual.', 'error');
      this.guardando = false; // Restablece guardando si la fecha es inválida
      return;
    }

    this.guardando = true;

    const body: CitaRq = {
      id: this.citaSelected?.id || null, // Incluye el ID de la cita actual si está en modo edición
      pacienteId: Number(this.form.getRawValue().pacienteId), // Incluye pacienteId aunque esté deshabilitado
      medicoId:   Number(this.form.getRawValue().medicoId),
      fechaHora:  fechaConSeg,
      estado:     String(this.form.getRawValue().estado).toUpperCase(),
      motivo:     this.form.getRawValue().motivo?.trim() || undefined
    };

    this.citasService.guardarCita(body).subscribe({
      next: (r) => {
        Swal.fire('Éxito', r?.mensaje || 'La cita se ha guardado correctamente.', 'success');
        this.closeModal();
        this.listarCitas();
      },
      error: (e) => {
        console.error(e);
        const msg = e?.error?.message || e?.error || 'Error guardando la cita.';
        Swal.fire('Error', msg, 'error');
        this.guardando = false; // Restablece guardando si ocurre un error en el backend
      },
      complete: () => {
        this.guardando = false; // Restablece guardando al finalizar la operación
      }
    });
  }
}