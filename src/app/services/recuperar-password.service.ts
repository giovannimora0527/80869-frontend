
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecuperarPasswordService {
  private apiUrlSolicitar = environment.apiUrl + '/auth/solicitar-codigo';
  private apiUrlVerificar = environment.apiUrl + '/auth/verificar-codigo';

  constructor(private http: HttpClient) {}

  solicitarCodigo(username: string): Observable<any> {
    return this.http.post<any>(this.apiUrlSolicitar, { username });
  }

  verificarCodigo(username: string, codigo: string, nuevaPassword: string): Observable<any> {
    return this.http.post<any>(this.apiUrlVerificar, { username, codigo, nuevaPassword });
  }
}
