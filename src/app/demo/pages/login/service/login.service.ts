import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { LoginRs } from '../models/login-rs';
import { LoginRq, SolicitarRecuperacionRq } from '../models/login-rq';
import { RespuestRs } from '../../usuario/models/respuestars';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  urlBase = environment.apiUrl;
  endpoint: string = 'auth';

  constructor(private readonly backendService: BackendService) {}

  loginUsuario(loginForm: LoginRq): Observable<LoginRs> {
    return this.backendService.post(this.urlBase, this.endpoint, 'login', loginForm);
  }

  solicitarRecuperacion(recuperacion: SolicitarRecuperacionRq): Observable<RespuestRs> {
    return this.backendService.post(this.urlBase, this.endpoint, 'pwdRequest', recuperacion);
  }
}
