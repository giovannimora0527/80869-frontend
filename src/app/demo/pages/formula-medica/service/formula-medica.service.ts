import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { FormulaMedica } from '../models/formula-medica';
import { FormulaMedicaRq } from '../models/formula-medica-rq';

@Injectable({ providedIn: 'root' })
export class FormulaMedicaService {
  apiUrl = environment.apiUrl;
  endpoint = 'formula-medica';

  constructor(private readonly backendService: BackendService) {}

  listarFormulas(): Observable<FormulaMedica[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, 'listar');
  }

  crearFormula(data: FormulaMedicaRq): Observable<any> {
    return this.backendService.post(this.apiUrl, this.endpoint, 'crear', data);
  }

  actualizarFormula(data: FormulaMedicaRq): Observable<any> {
    return this.backendService.put(this.apiUrl, this.endpoint, 'actualizar', data);
  }
}
