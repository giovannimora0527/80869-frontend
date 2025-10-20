import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PacienteService } from '../../../services/paciente.service';
import { Paciente } from '../../../model/paciente';

@Component({
  selector: 'app-paciente',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './paciente.component.html',
  styleUrl: './paciente.component.scss'
})
export class PacienteComponent implements OnInit {
  pacientes: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];
  pacienteForm: FormGroup;
  filtroForm: FormGroup;
  
  // Variables de control
  mostrarFormulario = false;
  modoEdicion = false;
  cargando = false;
  mensaje = '';
  tipoMensaje = 'success'; // 'success', 'error', 'warning'

  constructor(
    private pacienteService: PacienteService,
    private fb: FormBuilder
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.cargarPacientes();
  }

  inicializarFormularios(): void {
    // Formulario de paciente
    this.pacienteForm = this.fb.group({
      id: [null],
      usuarioId: [null],
      tipoDocumento: ['', [Validators.required]],
      numeroDocumento: ['', [Validators.required, Validators.minLength(6)]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      fechaNacimiento: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.minLength(7)]],
      direccion: ['', [Validators.required]]
    });

    // Formulario de filtros
    this.filtroForm = this.fb.group({
      nombres: [''],
      apellidos: [''],
      numeroDocumento: [''],
      telefono: [''],
      genero: ['']
    });
  }

  cargarPacientes(): void {
    this.cargando = true;
    this.pacienteService.listarPacientes().subscribe({
      next: (data) => {
        this.pacientes = data;
        this.pacientesFiltrados = [...data];
        this.cargando = false;
        this.mostrarMensaje('Pacientes cargados exitosamente', 'success');
      },
      error: (error) => {
        console.error('Error al cargar pacientes:', error);
        this.cargando = false;
        this.mostrarMensaje('Error al cargar pacientes', 'error');
      }
    });
  }

  // Métodos del formulario
  mostrarFormularioNuevo(): void {
    this.modoEdicion = false;
    this.mostrarFormulario = true;
    this.pacienteForm.reset();
  }

  editarPaciente(paciente: Paciente): void {
    this.modoEdicion = true;
    this.mostrarFormulario = true;
    this.pacienteForm.patchValue(paciente);
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.pacienteForm.reset();
    this.modoEdicion = false;
  }

  guardarPaciente(): void {
    if (this.pacienteForm.valid) {
      this.cargando = true;
      const paciente: Paciente = this.pacienteForm.value;
      
      const operacion = this.modoEdicion 
        ? this.pacienteService.actualizarPaciente(paciente)
        : this.pacienteService.guardarPaciente(paciente);

      operacion.subscribe({
        next: (pacienteGuardado) => {
          this.cargando = false;
          this.mostrarFormulario = false;
          this.pacienteForm.reset();
          this.cargarPacientes();
          const mensaje = this.modoEdicion ? 'Paciente actualizado exitosamente' : 'Paciente guardado exitosamente';
          this.mostrarMensaje(mensaje, 'success');
        },
        error: (error) => {
          this.cargando = false;
          console.error('Error al guardar paciente:', error);
          this.mostrarMensaje('Error al guardar el paciente', 'error');
        }
      });
    } else {
      this.mostrarMensaje('Por favor complete todos los campos requeridos', 'warning');
    }
  }

  eliminarPaciente(paciente: Paciente): void {
    if (confirm(`¿Está seguro de eliminar al paciente ${paciente.nombres} ${paciente.apellidos}?`)) {
      this.cargando = true;
      this.pacienteService.eliminarPaciente(paciente.numeroDocumento).subscribe({
        next: () => {
          this.cargando = false;
          this.cargarPacientes();
          this.mostrarMensaje('Paciente eliminado exitosamente', 'success');
        },
        error: (error) => {
          this.cargando = false;
          console.error('Error al eliminar paciente:', error);
          this.mostrarMensaje('Error al eliminar el paciente', 'error');
        }
      });
    }
  }

  // Métodos de filtro
  aplicarFiltros(): void {
    const filtros = this.filtroForm.value;
    
    // Si todos los filtros están vacíos, mostrar todos los pacientes
    const todosFiltrosVacios = Object.values(filtros).every(value => 
      !value || (typeof value === 'string' && value.trim() === '')
    );
    
    if (todosFiltrosVacios) {
      this.pacientesFiltrados = [...this.pacientes];
      return;
    }

    this.cargando = true;
    this.pacienteService.filtrarPacientes(filtros).subscribe({
      next: (data) => {
        this.pacientesFiltrados = data;
        this.cargando = false;
        this.mostrarMensaje(`Se encontraron ${data.length} pacientes`, 'success');
      },
      error: (error) => {
        this.cargando = false;
        console.error('Error al filtrar pacientes:', error);
        this.mostrarMensaje('Error al filtrar pacientes', 'error');
      }
    });
  }

  limpiarFiltros(): void {
    this.filtroForm.reset();
    this.pacientesFiltrados = [...this.pacientes];
    this.mostrarMensaje('Filtros limpiados', 'success');
  }

  // Método auxiliar para mostrar mensajes
  private mostrarMensaje(mensaje: string, tipo: string): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }
}
