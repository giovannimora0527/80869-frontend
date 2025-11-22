import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { AuditoriaService } from './service/auditoria.service';
import { AuditoriaLog, AuditoriaFiltro, AuditoriaEstadisticas } from './models/auditoria-log';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './auditoria.component.html',
  styleUrl: './auditoria.component.scss'
})
export class AuditoriaComponent implements OnInit {
  // Datos
  logs: AuditoriaLog[] = [];
  estadisticas: AuditoriaEstadisticas | null = null;
  tiposEventos: string[] = [];
  niveles: string[] = ['INFO', 'WARNING', 'ERROR', 'CRITICAL'];

  // Paginación
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;

  // Formulario de filtros
  filtroForm: FormGroup;

  // UI
  isLoading: boolean = false;
  mostrarEstadisticas: boolean = true;
  
  // Para usar Math en el template
  Math = Math;

  constructor(
    private readonly auditoriaService: AuditoriaService,
    private readonly formBuilder: FormBuilder,
    private readonly spinner: NgxSpinnerService
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.buscarLogs();
    // Tipos de eventos y niveles definidos localmente
    this.tiposEventos = [
      'LOGIN_EXITOSO',
      'LOGIN_FALLIDO', 
      'USUARIO_BLOQUEADO',
      'PASSWORD_RECOVERY',
      'PASSWORD_CHANGE'
    ];
    this.niveles = ['INFO', 'WARNING', 'ERROR', 'CRITICAL'];
  }

  /**
   * Inicializa el formulario de filtros
   */
  inicializarFormulario(): void {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    this.filtroForm = this.formBuilder.group({
      fechaDesde: [this.formatDateForInput(hace7Dias)],
      fechaHasta: [this.formatDateForInput(hoy)],
      tipoEvento: [''],
      username: [''],
      nivel: ['']
    });
  }

  /**
   * Carga las estadísticas de auditoría
   */
  cargarEstadisticas(): void {
    this.auditoriaService.obtenerEstadisticas().subscribe({
      next: (stats) => {
        console.log('📊 Estadísticas recibidas:', stats);
        this.estadisticas = stats;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  /**
   * Busca logs con los filtros actuales
   */
  buscarLogs(): void {
    this.isLoading = true;
    this.spinner.show();

    const filtro: AuditoriaFiltro = {
      page: this.currentPage,
      size: this.pageSize
    };

    const formValues = this.filtroForm.value;

    if (formValues.fechaDesde) {
      filtro.fechaDesde = new Date(formValues.fechaDesde);
    }
    if (formValues.fechaHasta) {
      filtro.fechaHasta = new Date(formValues.fechaHasta);
    }
    if (formValues.tipoEvento) {
      filtro.tipoEvento = formValues.tipoEvento;
    }
    if (formValues.username) {
      filtro.username = formValues.username;
    }
    if (formValues.nivel) {
      filtro.nivel = formValues.nivel;
    }

    this.auditoriaService.consultarLogs(filtro).subscribe({
      next: (response: any) => {
        // El backend retorna List<AuditoriaLog> directamente, no paginado
        if (Array.isArray(response)) {
          this.logs = response;
          this.totalElements = response.length;
          this.totalPages = Math.ceil(response.length / this.pageSize);
          this.currentPage = 0;
        } else if (response.content) {
          // Por si en el futuro el backend retorna paginado
          this.logs = response.content || [];
          this.totalPages = response.totalPages || 0;
          this.totalElements = response.totalElements || 0;
          this.currentPage = response.number || 0;
        } else {
          this.logs = [];
          this.totalPages = 0;
          this.totalElements = 0;
          this.currentPage = 0;
        }
        this.isLoading = false;
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Error al buscar logs:', error);
        this.logs = [];
        this.totalPages = 0;
        this.totalElements = 0;
        this.isLoading = false;
        this.spinner.hide();
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los logs de auditoría. Verifique que el backend esté corriendo.',
          icon: 'error'
        });
      }
    });
  }

  /**
   * Aplica los filtros y busca
   */
  aplicarFiltros(): void {
    this.currentPage = 0;
    this.buscarLogs();
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.filtroForm.reset();
    this.currentPage = 0;
    this.buscarLogs();
  }

  /**
   * Va a la página anterior
   */
  paginaAnterior(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.buscarLogs();
    }
  }

  /**
   * Va a la página siguiente
   */
  paginaSiguiente(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.buscarLogs();
    }
  }

  /**
   * Va a una página específica
   */
  irAPagina(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.buscarLogs();
    }
  }

  /**
   * Cambia el tamaño de página
   */
  cambiarTamanioPagina(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = parseInt(select.value);
    this.currentPage = 0;
    this.buscarLogs();
  }

  /**
   * Muestra el detalle de un log
   */
  verDetalle(log: AuditoriaLog): void {
    const datosAdicionales = log.datosAdicionales 
      ? `<pre>${JSON.stringify(log.datosAdicionales, null, 2)}</pre>`
      : 'No hay datos adicionales';

    Swal.fire({
      title: 'Detalle del Log',
      html: `
        <div class="text-left" style="text-align: left;">
          <p><strong>ID:</strong> ${log.id}</p>
          <p><strong>Fecha/Hora:</strong> ${this.formatDateTime(log.fechaHora)}</p>
          <p><strong>Tipo de Evento:</strong> ${log.tipoEvento}</p>
          <p><strong>Usuario:</strong> ${log.username || 'N/A'}</p>
          <p><strong>Email:</strong> ${log.email || 'N/A'}</p>
          <p><strong>Rol:</strong> ${log.rol || 'N/A'}</p>
          <p><strong>IP:</strong> ${log.ipAddress || 'N/A'}</p>
          <p><strong>Nivel:</strong> <span class="badge badge-${this.getBadgeClass(log.nivel)}">${log.nivel}</span></p>
          <p><strong>Módulo:</strong> ${log.modulo || 'N/A'}</p>
          <p><strong>Descripción:</strong> ${log.descripcion}</p>
          <p><strong>Datos Adicionales:</strong></p>
          ${datosAdicionales}
        </div>
      `,
      width: '800px',
      confirmButtonText: 'Cerrar'
    });
  }

  /**
   * Exporta los logs a CSV
   */
  exportarCSV(): void {
    if (this.logs.length === 0) {
      Swal.fire({
        title: 'Sin datos',
        text: 'No hay logs para exportar',
        icon: 'warning'
      });
      return;
    }

    const headers = ['ID', 'Fecha/Hora', 'Tipo Evento', 'Username', 'Email', 'IP', 'Nivel', 'Descripción'];
    const csv = [
      headers.join(','),
      ...this.logs.map(log => [
        log.id,
        this.formatDateTime(log.fechaHora),
        log.tipoEvento,
        log.username || '',
        log.email || '',
        log.ipAddress || '',
        log.nivel,
        `"${log.descripcion.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_logs_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      title: 'Exportado',
      text: 'Los logs se han exportado correctamente',
      icon: 'success',
      timer: 2000
    });
  }

  /**
   * Toggle para mostrar/ocultar estadísticas
   */
  toggleEstadisticas(): void {
    this.mostrarEstadisticas = !this.mostrarEstadisticas;
  }

  /**
   * Obtiene la clase CSS para el badge según el nivel
   */
  getBadgeClass(nivel: string): string {
    const classes: { [key: string]: string } = {
      'INFO': 'info',
      'WARNING': 'warning',
      'ERROR': 'danger',
      'CRITICAL': 'dark'
    };
    return classes[nivel] || 'secondary';
  }

  /**
   * Obtiene la clase CSS para el icono según el tipo de evento
   */
  getEventIcon(tipoEvento: string): string {
    const icons: { [key: string]: string } = {
      'LOGIN_EXITOSO': 'fa fa-check-circle text-success',
      'LOGIN_FALLIDO': 'fa fa-times-circle text-danger',
      'USUARIO_BLOQUEADO': 'fa fa-ban text-warning',
      'PASSWORD_RECOVERY_REQUEST': 'fa fa-key text-info',
      'PASSWORD_RECOVERY_SUCCESS': 'fa fa-check text-success',
      'PASSWORD_CHANGED': 'fa fa-lock text-primary',
      'ROL_CHANGED': 'fa fa-user-shield text-warning',
      'USUARIO_DESACTIVADO': 'fa fa-user-slash text-danger'
    };
    return icons[tipoEvento] || 'fa fa-info-circle text-muted';
  }

  /**
   * Formatea una fecha para mostrar
   */
  formatDateTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Formatea una fecha para el input datetime-local
   */
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Genera array de números para la paginación
   */
  getPaginas(): number[] {
    const maxPaginas = 5;
    const mitad = Math.floor(maxPaginas / 2);
    let inicio = Math.max(0, this.currentPage - mitad);
    let fin = Math.min(this.totalPages, inicio + maxPaginas);
    
    if (fin - inicio < maxPaginas) {
      inicio = Math.max(0, fin - maxPaginas);
    }
    
    return Array.from({ length: fin - inicio }, (_, i) => inicio + i);
  }
}
