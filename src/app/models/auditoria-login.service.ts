import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from '../services/backend.service'
import { environment } from 'src/environments/environment';
import { AuditoriaLogin, PageResponse } from '../models/auditoria-login.model';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaLoginService {

  private urlBase = environment.apiUrl;
  private endpoint = 'auditoria-login';

  constructor(private backend: BackendService) {}

  getLogs(
    filtros: { username?: string; fechaDesde?: string; fechaHasta?: string },
    page: number,
    size: number
  ): Observable<PageResponse<AuditoriaLogin>> {

    const params: any = {
      page,
      size
    };

    if (filtros.username)   params.username   = filtros.username;
    if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
    if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;

    // Llama a:  {apiUrl}/auditoria-login/listar?...
    return this.backend.get<PageResponse<AuditoriaLogin>>(
      this.urlBase,
      this.endpoint,
      'listar',
      params
    );
  }
}
