import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { HistoriaMedica } from '../models/historia-medica';
import { HistoriaMedicaRq } from '../models/historia-medica-rq';

@Injectable({ providedIn: 'root' })
export class HistoriaMedicaService {
  apiUrl = environment.apiUrl;
  endpoint = 'historia-medica';

  constructor(private readonly backendService: BackendService) {}

  listarHistorias(): Observable<HistoriaMedica[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, 'listar');
  }

  crearHistoria(data: HistoriaMedicaRq): Observable<any> {
    return this.backendService.post(this.apiUrl, this.endpoint, 'crear', data);
  }

  actualizarHistoria(data: HistoriaMedicaRq): Observable<any> {
    return this.backendService.put(this.apiUrl, this.endpoint, 'actualizar', data);
  }
}
