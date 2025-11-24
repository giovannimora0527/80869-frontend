import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { LoginRs } from '../models/login-rs';
import { LoginRq } from '../models/login-rq';
import { RespuestaRs } from '../../usuario/models/respuesta-rs'; // 👈 IMPORT NUEVO

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

  // 👇 MÉTODO NUEVO
  recuperarContrasena(username: string): Observable<RespuestaRs> {
    const body = { username: username };

    // Llama a: POST {apiUrl}/auth/recuperar-contrasena
    return this.backendService.post<RespuestaRs>(
      this.urlBase,
      this.endpoint,
      'recuperar-contrasena',
      body
    );
  }
}


