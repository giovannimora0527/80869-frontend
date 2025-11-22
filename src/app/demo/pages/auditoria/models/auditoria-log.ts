/**
 * Modelo para el log de auditoría
 */
export interface AuditoriaLog {
  id: number;
  fechaHora: Date;
  tipoEvento: string;
  usuarioId?: number;
  username: string;
  email?: string;
  rol?: string;
  ipAddress?: string;
  descripcion: string;
  datosAdicionales?: any;
  nivel: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  modulo?: string;
}

/**
 * Filtros para consultar logs de auditoría
 */
export interface AuditoriaFiltro {
  fechaDesde?: Date;
  fechaHasta?: Date;
  tipoEvento?: string;
  username?: string;
  nivel?: string;
  page?: number;
  size?: number;
}

/**
 * Respuesta paginada de logs
 */
export interface AuditoriaResponse {
  content: AuditoriaLog[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * Estadísticas de auditoría
 */
export interface AuditoriaEstadisticas {
  totalEventos: number;
  loginExitosos: number;
  loginFallidos: number;
  usuariosBloqueados: number;
  recuperacionesPassword: number;
  usuariosActivos: number;
  ipsDiferentes: number;
}
