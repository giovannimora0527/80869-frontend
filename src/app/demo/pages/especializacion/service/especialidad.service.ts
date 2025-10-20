import { Injectable } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Especialidad } from '../models/especialidad';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  apiUrl = environment.apiUrl;
  endpoint = 'especialidad';

  constructor(private readonly backendService: BackendService) {}
  
  listarPacientes(): Observable<Especialidad[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, 'listar');
  }
}
