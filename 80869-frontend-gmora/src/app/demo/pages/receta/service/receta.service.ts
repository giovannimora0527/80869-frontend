import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Receta } from '../models/receta';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {
  apiUrl = environment.apiUrl;
  endpoint = 'receta';

  constructor(private readonly backendService: BackendService) {}

  listarRecetas(): Observable<Receta[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, 'listar');
  }

  crearReceta(receta: any): Observable<any> {
    return this.backendService.post(this.apiUrl, this.endpoint, 'crear', receta);
  }

  actualizarReceta(receta: any): Observable<any> {
    return this.backendService.put(this.apiUrl, this.endpoint, 'actualizar', receta);
  }

  eliminarReceta(id: number): Observable<any> {
    return this.backendService.post(this.apiUrl, this.endpoint, 'eliminar', { id });
  }

  listarRecetasPorPaciente(pacienteId: number): Observable<Receta[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, `paciente/${pacienteId}`);
  }
}