import { Injectable } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Paciente } from '../models/paciente';
import { Observable } from 'rxjs/internal/Observable';
import { RespuestRs } from '../../usuario/models/respuestars';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  apiUrl = environment.apiUrl;
  endpoint = 'paciente';

  constructor(private readonly backendService: BackendService) {}
  
  listarPacientes(): Observable<Paciente[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, 'listar');
  }
  guardarPaciente(paciente: Paciente): Observable<RespuestRs> {
      return this.backendService.post(this.apiUrl, this.endpoint, 'guardar', paciente);
    }
  actualizarPaciente(paciente: Paciente): Observable<RespuestRs> {
      return this.backendService.post(this.apiUrl, this.endpoint, 'actualizar', paciente);
  }
}
