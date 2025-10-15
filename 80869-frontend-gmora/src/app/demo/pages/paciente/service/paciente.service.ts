import { Injectable } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Paciente } from '../models/paciente';
import { Observable } from 'rxjs/internal/Observable';

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
}
