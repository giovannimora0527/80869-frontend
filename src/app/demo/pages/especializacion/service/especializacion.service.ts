import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Especializacion } from '../models/especializacion';

@Injectable({ providedIn: 'root' })
export class EspecializacionService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'especializacion';

  constructor(private backendService: BackendService) {}

  listarEspecializaciones(): Observable<Especializacion[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, 'listar');
  }

  guardarEspecializacion(rq: Especializacion): Observable<any> {
    return this.backendService.post(this.apiUrl, this.endpoint, 'guardar', rq);
  }

  actualizarEspecializacion(rq: Especializacion): Observable<any> {
  return this.backendService.post(this.apiUrl, this.endpoint, 'actualizar', rq);
}

}
