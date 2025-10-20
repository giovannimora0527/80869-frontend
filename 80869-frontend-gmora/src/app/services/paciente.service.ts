import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { BackendService } from './backend.service';
import { Paciente } from '../model/paciente';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = environment.apiUrl;

  constructor(private backendService: BackendService) {}

  // Métodos existentes
  listarPacientes(): Observable<Paciente[]> {
    return this.backendService.get<Paciente[]>(this.apiUrl, '/paciente', 'listar');
  }

  buscarPacientePorDocumento(numeroDocumento: string): Observable<Paciente> {
    const params = new HttpParams().set('numeroDocumento', numeroDocumento);
    return this.backendService.get<Paciente>(this.apiUrl, '/paciente', 'buscar-x-documento', params);
  }

  listarPacientesOrdenado(): Observable<Paciente[]> {
    return this.backendService.get<Paciente[]>(this.apiUrl, '/paciente', 'listar-ordenado-nacimiento');
  }

  // Nuevos métodos CRUD
  guardarPaciente(paciente: Paciente): Observable<Paciente> {
    return this.backendService.post<Paciente>(this.apiUrl, '/paciente', 'guardar', paciente);
  }

  actualizarPaciente(paciente: Paciente): Observable<Paciente> {
    return this.backendService.put<Paciente>(this.apiUrl, '/paciente', 'actualizar', paciente);
  }

  eliminarPaciente(numeroDocumento: string): Observable<string> {
    const params = new HttpParams().set('numeroDocumento', numeroDocumento);
    return this.backendService.delete<string>(this.apiUrl, '/paciente', 'eliminar', params);
  }

  filtrarPacientes(filtros: {
    nombres?: string,
    apellidos?: string,
    numeroDocumento?: string,
    telefono?: string,
    genero?: string
  }): Observable<Paciente[]> {
    let params = new HttpParams();
    
    // Agregar parámetros solo si tienen valor
    if (filtros.nombres && filtros.nombres.trim() !== '') {
      params = params.set('nombres', filtros.nombres.trim());
    }
    if (filtros.apellidos && filtros.apellidos.trim() !== '') {
      params = params.set('apellidos', filtros.apellidos.trim());
    }
    if (filtros.numeroDocumento && filtros.numeroDocumento.trim() !== '') {
      params = params.set('numeroDocumento', filtros.numeroDocumento.trim());
    }
    if (filtros.telefono && filtros.telefono.trim() !== '') {
      params = params.set('telefono', filtros.telefono.trim());
    }
    if (filtros.genero && filtros.genero.trim() !== '') {
      params = params.set('genero', filtros.genero.trim());
    }

    return this.backendService.get<Paciente[]>(this.apiUrl, '/paciente', 'filtrar', params);
  }

  // Método auxiliar para guardar o actualizar (upsert)
  guardarOActualizarPaciente(paciente: Paciente): Observable<Paciente> {
    if (paciente.id && paciente.id > 0) {
      return this.actualizarPaciente(paciente);
    } else {
      return this.guardarPaciente(paciente);
    }
  }
}