import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service'; 
import { environment } from 'src/environments/environment';
import { Receta } from '../models/recetas';
import { RespuestRs } from '../models/respuestars';

@Injectable({ 
  providedIn: 'root'
})
export class RecetasService {
  apiUrl = environment.apiUrl;
  endpoint = 'receta'; // CORREGIDO: Debe ser singular para coincidir con el backend

  constructor(private readonly backendService: BackendService) {}

  listarRecetas(): Observable<Receta[]> {   
    return this.backendService.get(this.apiUrl, this.endpoint, 'listar');
  }

  guardarReceta(receta: Receta): Observable<RespuestRs> {
    return this.backendService.post(this.apiUrl, this.endpoint, 'guardar', receta);
  }
  
  actualizarReceta(receta: Receta): Observable<RespuestRs> {
    return this.backendService.put(this.apiUrl, this.endpoint, 'actualizar', receta);
  }
}