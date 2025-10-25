import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface RecetaRq {
  citaId: number;
  medicamentoId: number;
  dosis: string;
  indicaciones?: string;
}

export interface RecetaRs {
  id: number;
  fechaCreacionRegistro: string;
  dosis: string;
  indicaciones?: string;
  citaId: number;
  medicamentoId: number;
  nombreMedicamento: string;
}

export interface RespuestaRs {
  mensaje: string;
  status: number;
}

export interface Cita {
  id: number;
  fechaHora: string;
  estado: string;
  pacienteNombre?: string; 
  nombreCompletoPaciente: string; 
  medicoId?: number;
  nombreCompletoMedico?: string;
}

export interface Medicamento {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecetasService {
  private readonly apiUrl = 'http://localhost:8000/clinica/v1/receta'; 
  // use existing backend endpoint /cita/listar
  private readonly citasUrl = 'http://localhost:8000/clinica/v1/cita/listar'; 
  private readonly medicamentosUrl = 'http://localhost:8000/clinica/v1/medicamento/listar'; 
  constructor(private readonly http: HttpClient) {}

  listarRecetas(): Observable<RecetaRs[]> {
    return this.http.get<RecetaRs[]>(`${this.apiUrl}/listar`);
  }

  guardarReceta(receta: RecetaRq): Observable<RespuestaRs> {
    return this.http.post<RespuestaRs>(`${this.apiUrl}/guardar`, receta);
  }

  listarCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.citasUrl);
  }

  /**
   * Lista las citas disponibles para crear recetas
   * Solo muestra citas que no estén cumplidas o canceladas
   */
  listarCitasDisponiblesParaRecetas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.citasUrl).pipe(
      map(citas => this.filtrarCitasDisponibles(citas))
    );
  }

  private filtrarCitasDisponibles(citas: Cita[]): Cita[] {
    // Filtro simple: solo excluir citas cumplidas y canceladas
    return citas.filter(cita => {
      return cita.estado !== 'CUMPLIDA' && cita.estado !== 'CANCELADA';
    });
  }

  listarMedicamentos(): Observable<Medicamento[]> {
    return this.http.get<Medicamento[]>(this.medicamentosUrl);
  }
}