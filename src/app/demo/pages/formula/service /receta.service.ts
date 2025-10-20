import { Injectable } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Receta } from '../models/receta';
import { Observable } from 'rxjs/internal/Observable';

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
}
