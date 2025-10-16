import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Medicamento } from '../models/medicamento';
import { MedicamentoRq } from '../models/medicamento-rq';

@Injectable({
  providedIn: 'root'
})
export class MedicamentoService {
  apiUrl = environment.apiUrl;
  endpoint = 'medicamento';

  constructor(private readonly backendService: BackendService) {}

  listarMedicamentos(): Observable<Medicamento[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, 'listar');
  }

  crearMedicamento(data: MedicamentoRq): Observable<any> {
    return this.backendService.post(this.apiUrl, this.endpoint, 'crear', data);
  }

  actualizarMedicamento(data: MedicamentoRq): Observable<any> {
  return this.backendService.put(this.apiUrl, this.endpoint, 'actualizar', data);
  }
}


