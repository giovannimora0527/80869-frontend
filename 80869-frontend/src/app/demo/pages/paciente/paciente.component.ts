import { Component } from '@angular/core';
import { PacienteService } from './service/paciente.service';
import { Paciente } from './models/paciente';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importa los objetos necesarios de Bootstrap
import Modal from 'bootstrap/js/dist/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-paciente',
  imports: [CommonModule, FormsModule],
  templateUrl: './paciente.component.html',
  styleUrl: './paciente.component.scss'
})
export class PacienteComponent {
  /**
   * Variables para el modal.
   */
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  titleModal: string = '';
  titleBoton: string = '';
  pacienteSelected: Paciente = new Paciente();

  /**
   * Variables para la tabla de datos o datatable.
   */
  pacienteList: Paciente[] = [];
  pacienteListOriginal: Paciente[] = []; // Lista original sin filtrar
  pacienteListFiltrada: Paciente[] = []; // Lista filtrada para mostrar

  /**
   * Variables para búsqueda
   */
  busquedaNombre: string = '';
  busquedaDocumento: string = '';

  /**
   * Variable para controlar el estado de guardado
   */
  guardando = false;

  /**
   * Variables para filtros
   */
  filtros = {
    id: '',
    tipoDocumento: '',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    genero: '',
    telefono: '',
    direccion: ''
  };

  /**
   * Variables para ordenamiento
   */
  ordenActual = {
    campo: '',
    direccion: 'asc' // 'asc' o 'desc'
  };

  /**
   * Opciones para los selects
   */
  tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PP', label: 'Pasaporte' }
  ];

  generosDisponibles = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' }
  ];

  constructor(private readonly pacienteService: PacienteService) {
    this.listarPacientes();
  }

  listarPacientes() {
    this.pacienteService.listarPacientes().subscribe({
      next: (data) => {
        this.pacienteListOriginal = data;
        this.pacienteList = [...data]; // Copia para mostrar       
      },
      error: (error) => {
        console.error('Error fetching paciente list:', error);
        Swal.fire('Error', 'No se pudieron cargar los pacientes.', 'error');
      }
    });
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Paciente' : 'Editar Paciente';
    this.titleBoton = modo === 'C' ? 'Guardar Paciente' : 'Actualizar Paciente';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearPaciente');
    if (modalElement) {
      // Verificar si ya existe una instancia del modal
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  abrirNuevoPaciente() {
    this.pacienteSelected = new Paciente();
    this.openModal('C');
  }

  editarModalPaciente(paciente: Paciente) {
    this.pacienteSelected = { ...paciente }; // Crear una copia para evitar modificar directamente
    
    // ✅ CORRECCIÓN: Formatear fecha para el input date (solo fecha, sin hora)
    if (this.pacienteSelected.fechaNacimiento) {
      // Extraer solo la parte de la fecha (YYYY-MM-DD)
      this.pacienteSelected.fechaNacimiento = this.pacienteSelected.fechaNacimiento.split('T')[0];
    }
    
    console.log('Paciente a editar:', paciente);
    this.openModal('E');
  }

  guardarPaciente() {
    if (!this.validarFormulario()) {
      return;
    }

    this.guardando = true;
    // Formatear la fecha antes de enviar
    const pacienteParaEnviar = { ...this.pacienteSelected };
    
    // ✅ CORRECCIÓN: Formatear fecha para el backend
    if (pacienteParaEnviar.fechaNacimiento) {
      // Si la fecha no tiene hora, agregarla
      if (!pacienteParaEnviar.fechaNacimiento.includes('T')) {
        pacienteParaEnviar.fechaNacimiento = pacienteParaEnviar.fechaNacimiento + 'T00:00:00';
      }
    }
    
    if (this.modoFormulario === 'C') {
      // Crear nuevo paciente
      this.pacienteService.guardarPaciente(pacienteParaEnviar).subscribe({
        next: (response) => {
          Swal.fire('Éxito', 'El paciente se ha creado correctamente.', 'success');
          this.listarPacientes(); // Recargar la lista
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al crear paciente:', error);
          const msg = error?.error?.message || error?.error || 'Error al crear el paciente. Verifique los datos e intente nuevamente.';
          Swal.fire('Error', msg, 'error');
        },
        complete: () => {
          this.guardando = false;
        }
      });
    } else if (this.modoFormulario === 'E') {
      // Actualizar paciente existente
      this.pacienteService.actualizarPaciente(pacienteParaEnviar).subscribe({
        next: (response) => {
          Swal.fire('Éxito', 'El paciente se ha actualizado correctamente.', 'success');
          this.listarPacientes(); // Recargar la lista
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al actualizar paciente:', error);
          const msg = error?.error?.message || error?.error || 'Error al actualizar el paciente. Verifique los datos e intente nuevamente.';
          Swal.fire('Error', msg, 'error');
        },
        complete: () => {
          this.guardando = false;
        }
      });
    }
  }

  private validarFormulario(): boolean {
    if (!this.pacienteSelected.tipoDocumento || !this.pacienteSelected.numeroDocumento || 
        !this.pacienteSelected.nombres || !this.pacienteSelected.apellidos || 
        !this.pacienteSelected.fechaNacimiento || !this.pacienteSelected.genero) {
      Swal.fire('Error', 'Por favor complete todos los campos obligatorios.', 'error');
      return false;
    }
    return true;
  }

  buscarPorDocumento() {
    if (this.pacienteSelected.numeroDocumento) {
      this.pacienteService.buscarPorDocumento(this.pacienteSelected.numeroDocumento).subscribe({
        next: (paciente) => {
          if (paciente) {
            console.log('Paciente encontrado:', paciente);
            Swal.fire('Éxito', 'Paciente encontrado correctamente.', 'success');
            // Aquí puedes hacer algo con el paciente encontrado
          }
        },
        error: (error) => {
          console.error('Paciente no encontrado:', error);
          Swal.fire('Información', 'No se encontró un paciente con ese número de documento.', 'info');
        }
      });
    } else {
      Swal.fire('Error', 'Por favor ingrese un número de documento.', 'error');
    }
  }

  /**
   * Métodos para filtros y ordenamiento
   */
  aplicarFiltros() {
    this.pacienteListFiltrada = this.pacienteList.filter(paciente => {
      return (
        paciente.id.toString().toLowerCase().includes(this.filtros.id.toLowerCase()) &&
        paciente.tipoDocumento.toLowerCase().includes(this.filtros.tipoDocumento.toLowerCase()) &&
        paciente.numeroDocumento.toLowerCase().includes(this.filtros.numeroDocumento.toLowerCase()) &&
        paciente.nombres.toLowerCase().includes(this.filtros.nombres.toLowerCase()) &&
        paciente.apellidos.toLowerCase().includes(this.filtros.apellidos.toLowerCase()) &&
        (paciente.fechaNacimiento ? paciente.fechaNacimiento.toString().includes(this.filtros.fechaNacimiento) : true) &&
        paciente.genero.toLowerCase().includes(this.filtros.genero.toLowerCase()) &&
        (paciente.telefono ? paciente.telefono.toLowerCase().includes(this.filtros.telefono.toLowerCase()) : true) &&
        (paciente.direccion ? paciente.direccion.toLowerCase().includes(this.filtros.direccion.toLowerCase()) : true)
      );
    });
  }

  limpiarFiltros() {
    this.filtros = {
      id: '',
      tipoDocumento: '',
      numeroDocumento: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: '',
      genero: '',
      telefono: '',
      direccion: ''
    };
    this.aplicarFiltros();
  }

  ordenarPor(campo: string) {
    // Si es el mismo campo, cambiar dirección, si no, ordenar ascendente
    if (this.ordenActual.campo === campo) {
      this.ordenActual.direccion = this.ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenActual.campo = campo;
      this.ordenActual.direccion = 'asc';
    }

    this.pacienteList.sort((a: any, b: any) => {
      let valorA = a[campo];
      let valorB = b[campo];

      // Manejar valores null/undefined
      if (valorA == null) valorA = '';
      if (valorB == null) valorB = '';

      // Si son números, convertir a número
      if (campo === 'id') {
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
      if (campo === 'id') {
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

  /**
   * Métodos para búsqueda
   */
  buscarPacientes() {
    let listaFiltrada = [...this.pacienteListOriginal];

    // Filtrar por nombre (busca en nombres y apellidos)
    if (this.busquedaNombre && this.busquedaNombre.trim() !== '') {
      const nombreBusqueda = this.busquedaNombre.toLowerCase().trim();
      listaFiltrada = listaFiltrada.filter(paciente => 
        paciente.nombres.toLowerCase().includes(nombreBusqueda) ||
        paciente.apellidos.toLowerCase().includes(nombreBusqueda) ||
        (paciente.nombres + ' ' + paciente.apellidos).toLowerCase().includes(nombreBusqueda)
      );
    }

    // Filtrar por documento
    if (this.busquedaDocumento && this.busquedaDocumento.trim() !== '') {
      const documentoBusqueda = this.busquedaDocumento.toLowerCase().trim();
      listaFiltrada = listaFiltrada.filter(paciente => 
        paciente.numeroDocumento.toLowerCase().includes(documentoBusqueda)
      );
    }

    this.pacienteList = listaFiltrada;
  }

  limpiarBusqueda() {
    this.busquedaNombre = '';
    this.busquedaDocumento = '';
    this.pacienteList = [...this.pacienteListOriginal];
  }


}
