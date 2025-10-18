import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Medico } from '../models/medico';
import { RespuestRs } from '../../usuario/models/respuestars';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  apiUrl = environment.apiUrl;
  endpoint = 'medico';

  constructor(private readonly backendService: BackendService) {}

  listarMedicos(): Observable<Medico[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, 'listar');
  }

  guardarMedico(medico: Medico): Observable<RespuestRs> {
    return this.backendService.post(this.apiUrl, this.endpoint, 'guardar', medico);
  }

  actualizarMedico(medico: Medico): Observable<RespuestRs> {
    return this.backendService.post(this.apiUrl, this.endpoint, 'actualizar', medico);
  }
}
