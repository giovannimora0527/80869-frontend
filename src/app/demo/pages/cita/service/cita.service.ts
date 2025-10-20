import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Cita } from '../models/cita';

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
}
