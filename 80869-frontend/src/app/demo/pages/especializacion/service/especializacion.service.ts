import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EspecializacionRq {
  id?: number;
  nombre: string;
  descripcion?: string;
  codigoEspecializacion: string;
}

export interface EspecializacionRs {
  id: number;
  nombre: string;
  descripcion: string;
  codigoEspecializacion: string;
}

export interface RespuestaRs {
  mensaje: string;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class EspecializacionService {
  private readonly apiUrl = 'http://localhost:8000/clinica/v1/especializacion';

  constructor(private readonly http: HttpClient) {}

  listarEspecializaciones(): Observable<EspecializacionRs[]> {
    return this.http.get<EspecializacionRs[]>(`${this.apiUrl}/listar`);
  }

  guardarEspecializacion(especializacion: EspecializacionRq): Observable<RespuestaRs> {
    if (especializacion.id) {
      return this.http.put<RespuestaRs>(`${this.apiUrl}/actualizar/${especializacion.id}`, especializacion);
    } else {
      return this.http.post<RespuestaRs>(`${this.apiUrl}/guardar`, especializacion);
    }
  }

  buscarPorCodigo(codigo: string): Observable<EspecializacionRs> {
    return this.http.get<EspecializacionRs>(`${this.apiUrl}/buscar/${codigo}`);
  }
}