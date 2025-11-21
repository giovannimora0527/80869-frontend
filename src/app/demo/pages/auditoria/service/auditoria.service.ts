import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from '../../../../services/backend.service';
import { AuditoriaLog, AuditoriaFiltro, AuditoriaResponse, AuditoriaEstadisticas } from '../models/auditoria-log';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private readonly urlBase = 'auditoria';
  private readonly endpoint = '';

  constructor(private readonly backendService: BackendService) { }

  /**
   * Consulta logs de auditoría con filtros y paginación
   */
  consultarLogs(filtro: AuditoriaFiltro): Observable<AuditoriaResponse> {
    const params: any = {
      page: filtro.page || 0,
      size: filtro.size || 10
    };

    if (filtro.fechaDesde) {
      params.fechaDesde = this.formatDate(filtro.fechaDesde);
    }
    if (filtro.fechaHasta) {
      params.fechaHasta = this.formatDate(filtro.fechaHasta);
    }
    if (filtro.tipoEvento) {
      params.tipoEvento = filtro.tipoEvento;
    }
    if (filtro.username) {
      params.username = filtro.username;
    }
    if (filtro.nivel) {
      params.nivel = filtro.nivel;
    }

    return this.backendService.get(this.urlBase, this.endpoint, 'logs', params);
  }

  /**
   * Obtiene estadísticas de auditoría
   */
  obtenerEstadisticas(): Observable<AuditoriaEstadisticas> {
    return this.backendService.get(this.urlBase, this.endpoint, 'estadisticas');
  }

  /**
   * Obtiene lista de tipos de eventos disponibles
   */
  obtenerTiposEventos(): Observable<string[]> {
    return this.backendService.get(this.urlBase, this.endpoint, 'tipos-evento');
  }

  /**
   * Obtiene lista de niveles disponibles
   */
  obtenerNiveles(): Observable<string[]> {
    return this.backendService.get(this.urlBase, this.endpoint, 'niveles');
  }

  /**
   * Formatea una fecha para enviar al backend
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
}
