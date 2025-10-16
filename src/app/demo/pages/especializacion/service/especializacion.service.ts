import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Especializacion } from '../models/especializacion';
import { EspecializacionRq } from '../models/especializacion-rq';

@Injectable({ providedIn: 'root' })
export class EspecializacionService {
  apiUrl = environment.apiUrl;
  endpoint = 'especializacion';

  constructor(private readonly backendService: BackendService) {}

  listarEspecializaciones(): Observable<Especializacion[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, 'listar');
  }

  crearEspecializacion(data: EspecializacionRq): Observable<any> {
    return this.backendService.post(this.apiUrl, this.endpoint, 'crear', data);
  }

  actualizarEspecializacion(data: EspecializacionRq): Observable<any> {
    return this.backendService.put(this.apiUrl, this.endpoint, 'actualizar', data);
  }
}
