import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { LoginRs } from '../models/login-rs';
import { LoginRq } from '../models/login-rq';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  urlBase = environment.apiUrl;
  endpoint: string = 'auth';
  passwordRecoveryEndpoint: string = 'password-recovery';

  constructor(private readonly backendService: BackendService) {}

  /**
   * Realiza el login del usuario
   */
  loginUsuario(loginForm: LoginRq): Observable<LoginRs> {
    return this.backendService.post(this.urlBase, this.endpoint, 'login', loginForm);
  }

  /**
   * Solicita recuperación de contraseña
   * @param username Nombre de usuario
   */
  solicitarRecuperacionPassword(username: string): Observable<any> {
    return this.backendService.post(
      this.urlBase, 
      this.passwordRecoveryEndpoint, 
      'request', 
      { username }
    );
  }
}
