import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Cita } from '../models/cita';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  apiUrl = environment.apiUrl;
  endpoint = 'cita';

  constructor(private readonly backendService: BackendService) {}

  listarCitas(): Observable<Cita[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, 'listar');
  }

  crearCita(cita: any): Observable<any> {
    return this.backendService.post(this.apiUrl, this.endpoint, 'crear', cita);
  }

  actualizarCita(cita: any): Observable<any> {
    return this.backendService.put(this.apiUrl, this.endpoint, 'actualizar', cita);
  }

  eliminarCita(id: number): Observable<any> {
    return this.backendService.post(this.apiUrl, this.endpoint, 'eliminar', { id });
  }

  listarCitasPorFecha(fecha: string): Observable<Cita[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, `fecha/${fecha}`);
  }

  listarCitasPorMedico(medicoId: number): Observable<Cita[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, `medico/${medicoId}`);
  }

  listarCitasPorPaciente(pacienteId: number): Observable<Cita[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, `paciente/${pacienteId}`);
  }
}