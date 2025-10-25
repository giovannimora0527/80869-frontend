export interface Especializacion {
  id: number;
  nombre: string;
  descripcion?: string;
  codigo?: string;
}

// Tipo para recibir datos del backend
export class Medico {
  id!: number;
  tipoDocumento!: string;
  documento!: string;
  nombres!: string;
  apellidos!: string;
  telefono!: string;
  registroProfesional!: string;
  especializacionId!: number;
  especializacion!: Especializacion;  // Objeto completo de especialización
}

// Tipo para enviar datos al backend (sin el objeto especialización completo)
export interface MedicoRequest {
  id?: number;
  tipoDocumento: string;
  documento: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  registroProfesional: string;
  especializacionId: number;
}