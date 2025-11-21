/**
 * Respuesta del login
 */
export class LoginRs {
    token!: string;
    username?: string;
    email?: string;
    rol?: string;
}

/**
 * Respuesta de error con información de bloqueo
 */
export interface LoginError {
    error: string;
    mensaje: string;
    bloqueado?: boolean;
    bloqueadoHasta?: string;
    intentosRestantes?: number;
}