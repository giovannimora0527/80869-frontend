import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { InventarioMedicamento, InventarioMedicamentoRq } from '../models/inventario-medicamento';

@Injectable({ providedIn: 'root' })
export class InventarioMedicamentoService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'inventario-medicamento';

  constructor(private backendService: BackendService) {}

  listarInventario(): Observable<InventarioMedicamento[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, 'listar');
  }

  guardarInventario(rq: InventarioMedicamentoRq): Observable<any> {
    return this.backendService.post(this.apiUrl, this.endpoint, 'guardar', rq);
  }

  // Actualiza el inventario: backend espera id como request param y el DTO en el body.
  actualizarInventario(id: number, rq: InventarioMedicamentoRq): Observable<any> {
    return this.backendService.put(this.apiUrl, this.endpoint, `actualizar?id=${id}`, rq);
  }

  listarPorMedicamento(idMedicamento: number): Observable<InventarioMedicamento[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, 'listar-x-medicamento?idMedicamento=' + idMedicamento);
  }
}
