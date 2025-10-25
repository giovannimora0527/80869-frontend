import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Receta } from '../models/formula';
import { RespuestaRs } from '../../usuario/models/respuesta-rs';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {
  urlBase = environment.apiUrl;
  endpoint: string = 'receta';

  constructor(private readonly backendService: BackendService) {}

  listarRecetas(): Observable<Receta[]> {
    return this.backendService.get(this.urlBase, this.endpoint, 'listar');
  }

  guardarReceta(receta: Receta): Observable<RespuestaRs> {
    return this.backendService.post(this.urlBase, this.endpoint, 'guardar', receta);
  }

  actualizarReceta(receta: Receta): Observable<RespuestaRs> {
    return this.backendService.post(this.urlBase, this.endpoint, 'actualizar', receta);
  }
}
