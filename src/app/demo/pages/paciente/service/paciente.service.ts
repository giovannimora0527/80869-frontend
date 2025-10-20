import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from '../models/paciente';
import { RespuestRs } from '../../usuario/models/respuestars';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private baseUrl = 'http://localhost:8080/api/pacientes'; // cambia según tu backend

  constructor(private http: HttpClient) {}

  listarPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.baseUrl}/listar`);
  }

  crearPaciente(paciente: Paciente): Observable<RespuestRs> {
    return this.http.post<RespuestRs>(`${this.baseUrl}/crear`, paciente);
  }

  actualizarPaciente(paciente: Paciente): Observable<RespuestRs> {
    return this.http.put<RespuestRs>(`${this.baseUrl}/actualizar/${paciente.id}`, paciente);
  }

  eliminarPaciente(id: number): Observable<RespuestRs> {
    return this.http.delete<RespuestRs>(`${this.baseUrl}/eliminar/${id}`);
  }
}
