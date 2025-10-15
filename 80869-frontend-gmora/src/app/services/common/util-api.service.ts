import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BackendService } from '../backend.service';
import { Observable } from 'rxjs';
import { Especializacion } from 'src/app/demo/pages/medico/models/especializacion';

@Injectable({
  providedIn: 'root'
})
export class UtilApiService {
  apiUrl = environment.apiUrl;  

  constructor(private readonly backendService: BackendService) { }

  listarEspecialidades(endpoint: string): Observable<Especializacion[]> {
    return this.backendService.get(this.apiUrl, endpoint, 'listar');
  }
}
