export interface AuditoriaLogin {
  id: number;
  username: string;
  fecha: string;   // viene como string ISO
  ip?: string;
  descripcion: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;  // página actual
  size: number;    // tamaño de página
}

