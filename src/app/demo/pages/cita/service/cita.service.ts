import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Cita } from '../models/cita';
import { CitaRq } from '../models/cita-rq';

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

  crearCita(data: CitaRq): Observable<any> {
    return this.backendService.post(this.apiUrl, this.endpoint, 'crear', data);
  }

  actualizarCita(data: CitaRq): Observable<any> {
    return this.backendService.put(this.apiUrl, this.endpoint, 'actualizar', data);
  }
}
