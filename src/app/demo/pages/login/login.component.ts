import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { LoginService } from './service/login.service';
import { Router } from '@angular/router';
import { LoginError } from './models/login-rs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  mostrarPassword: boolean = false;
  isLoading: boolean = false;
  titleSpinner: string = 'Autenticando...';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly spinner: NgxSpinnerService,
    private readonly loginService: LoginService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      recordarSesion: [false]
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  toggleMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.spinner.show();

      // Simular llamada al servicio de autenticación
      const loginData = {
        username: this.f['username'].value,
        password: this.f['password'].value,
        recordarSesion: this.f['recordarSesion'].value
      };

      console.log('Datos de login:', loginData);
      this.loginService.loginUsuario(loginData).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          
          // Guardar en AuthService y localStorage
          this.authService.login(response, {
            id: 0, // Se llenará con datos del backend
            username: response.username || loginData.username,
            email: response.email || '',
            rol: response.rol || 'user',
            fechaCreacion: new Date(),
            activo: true
          });
          
          this.isLoading = false;
          this.spinner.hide();
          
          Swal.fire({
            title: '¡Bienvenido!',
            text: 'Inicio de sesión exitoso',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            this.isLoading = false;
            this.router.navigate(['/inicio']);
          });
        },
        error: (error) => {
          this.spinner.hide();
          this.isLoading = false;
          console.error('Error en la autenticación:', error);
          
          this.manejarErrorLogin(error);
        }
      });
    } else {
      this.spinner.hide();
      this.isLoading = false;
      // Marcar todos los campos como tocados para mostrar errores
      this.loginForm.markAllAsTouched();
      Swal.fire({
        title: 'Error',
        text: 'Por favor complete todos los campos requeridos',
        icon: 'error'
      });
    }
  }

  /**
   * Muestra el modal de recuperación de contraseña
   */
  onForgotPassword(event: Event): void {
    event.preventDefault();

    Swal.fire({
      title: 'Recuperar Contraseña',
      html: `
        <div class="text-left">
          <p>Ingrese su nombre de usuario para recibir una contraseña temporal.</p>
          <div class="form-group">
            <label for="username-recovery">Nombre de Usuario</label>
            <input 
              id="username-recovery" 
              class="swal2-input" 
              type="text"
              placeholder="Ingrese su usuario"
              style="width: 100%; margin: 10px 0;">
          </div>
          <div class="alert alert-info mt-3" style="font-size: 0.85rem;">
            <i class="fa fa-info-circle"></i>
            Si el usuario existe, recibirá una contraseña temporal en su correo electrónico registrado.
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fa fa-paper-plane"></i> Enviar',
      cancelButtonText: '<i class="fa fa-times"></i> Cancelar',
      confirmButtonColor: '#4680ff',
      cancelButtonColor: '#6c757d',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const usernameInput = document.getElementById('username-recovery') as HTMLInputElement;
        const username = usernameInput?.value?.trim();

        if (!username) {
          Swal.showValidationMessage('El nombre de usuario es requerido');
          return false;
        }

        if (username.length < 3) {
          Swal.showValidationMessage('El nombre de usuario debe tener al menos 3 caracteres');
          return false;
        }

        // Llamar al servicio de recuperación
        return this.loginService.solicitarRecuperacionPassword(username)
          .toPromise()
          .then(response => {
            return { success: true, mensaje: response?.mensaje };
          })
          .catch(error => {
            console.error('Error en recuperación:', error);
            // NO mostrar error específico por seguridad
            return { success: true, mensaje: 'Solicitud procesada' };
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Solicitud Procesada',
          html: `
            <p>Si el usuario existe, se enviará una contraseña temporal al correo electrónico registrado.</p>
            <p class="text-muted mt-2" style="font-size: 0.9rem;">
              <i class="fa fa-clock"></i> 
              La contraseña temporal expira en 24 horas.
            </p>
          `,
          icon: 'info',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#4680ff'
        });
      }
    });
  }

  /**
   * Maneja los errores de login con información detallada
   */
  private manejarErrorLogin(error: any): void {
    const errorData: LoginError = error?.error || {};
    
    // Usuario bloqueado
    if (errorData.bloqueado) {
      const bloqueadoHasta = errorData.bloqueadoHasta 
        ? new Date(errorData.bloqueadoHasta)
        : null;
      
      const minutos = bloqueadoHasta 
        ? Math.ceil((bloqueadoHasta.getTime() - new Date().getTime()) / 60000)
        : 5;

      Swal.fire({
        title: '🔒 Usuario Bloqueado',
        html: `
          <div class="alert alert-warning">
            <i class="fa fa-exclamation-triangle fa-2x mb-3"></i>
            <p><strong>Su cuenta ha sido bloqueada temporalmente</strong></p>
            <p>Ha excedido el número máximo de intentos de inicio de sesión.</p>
            <hr>
            <p class="mb-0">
              <i class="fa fa-clock"></i> 
              Tiempo restante: <strong>${minutos} minuto${minutos !== 1 ? 's' : ''}</strong>
            </p>
          </div>
          <p class="text-muted mt-3">
            <small>
              ¿Olvidó su contraseña? 
              <a href="#" id="forgot-password-link" style="color: #4680ff; text-decoration: underline;">
                Recuperar contraseña
              </a>
            </small>
          </p>
        `,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#FF5370',
        didOpen: () => {
          const link = document.getElementById('forgot-password-link');
          link?.addEventListener('click', (e) => {
            Swal.close();
            this.onForgotPassword(e);
          });
        }
      });
      return;
    }

    // Credenciales incorrectas con intentos restantes
    if (errorData.intentosRestantes !== undefined) {
      const intentos = errorData.intentosRestantes;
      
      Swal.fire({
        title: '❌ Credenciales Incorrectas',
        html: `
          <p>${errorData.mensaje || 'Usuario o contraseña incorrectos'}</p>
          ${intentos > 0 ? `
            <div class="alert alert-warning mt-3">
              <i class="fa fa-exclamation-circle"></i>
              Le quedan <strong>${intentos} intento${intentos !== 1 ? 's' : ''}</strong> 
              antes de que su cuenta sea bloqueada.
            </div>
          ` : ''}
          <p class="text-muted mt-3">
            <small>
              ¿Olvidó su contraseña? 
              <a href="#" id="forgot-password-link" style="color: #4680ff; text-decoration: underline;">
                Recuperar contraseña
              </a>
            </small>
          </p>
        `,
        icon: 'error',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#4680ff',
        didOpen: () => {
          const link = document.getElementById('forgot-password-link');
          link?.addEventListener('click', (e) => {
            Swal.close();
            this.onForgotPassword(e);
          });
        }
      });
      return;
    }

    // Error genérico
    Swal.fire({
      title: 'Error de Autenticación',
      text: errorData.mensaje || 'Usuario o contraseña incorrectos. Por favor, intente nuevamente.',
      icon: 'error',
      confirmButtonText: 'Reintentar',
      confirmButtonColor: '#4680ff',
      footer: `
        <a href="#" id="forgot-password-link" style="color: #4680ff;">
          ¿Olvidó su contraseña?
        </a>
      `,
      didOpen: () => {
        const link = document.getElementById('forgot-password-link');
        link?.addEventListener('click', (e) => {
          Swal.close();
          this.onForgotPassword(e);
        });
      }
    });
  }
}
