import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private base = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) {}

  search(params: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params.usuario) httpParams = httpParams.set('usuario', params.usuario);
    if (params.exito !== undefined && params.exito !== null) httpParams = httpParams.set('exito', params.exito);
    if (params.start) httpParams = httpParams.set('start', params.start);
    if (params.end) httpParams = httpParams.set('end', params.end);
    httpParams = httpParams.set('page', params.page ?? 0);
    httpParams = httpParams.set('size', params.size ?? 20);
    return this.http.get<any>(this.base + '/auditoria-login', { params: httpParams });
  }
}
