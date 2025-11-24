import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { LoginService } from './service/login.service';
import { Router } from '@angular/router';

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

  // =========================
  //   LOGIN
  // =========================
  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.spinner.show();

      const loginData = {
        username: this.f['username'].value,
        password: this.f['password'].value,
        recordarSesion: this.f['recordarSesion'].value
      };

      this.loginService.loginUsuario(loginData).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          localStorage.setItem('token', response.token);
          this.isLoading = false;
          this.spinner.hide();
          Swal.fire({
            title: 'Éxito',
            text: 'Inicio de sesión exitoso',
            icon: 'success'
          }).then(() => {
            this.isLoading = false;
            this.router.navigate(['/inicio']);
          });
        },
        error: (error) => {
          this.spinner.hide();
          this.isLoading = false;

          console.error('Error completo en la autenticación:', error);

          // 👇 AQUÍ LEEMOS EL MENSAJE QUE MANDA EL BACKEND
          // Probamos varias opciones: error.error.mensaje, error.error.message, error.message
          let mensajeBackend: string = 'Usuario o contraseña incorrectos';

          if (error?.error) {
            if (typeof error.error === 'string') {
              // Si el backend devolvió solo texto plano
              mensajeBackend = error.error;
            } else if (error.error.mensaje) {
              // Caso en que el backend mande { mensaje: '...' }
              mensajeBackend = error.error.mensaje;
            } else if (error.error.message) {
              // Caso típico de Spring Boot: { message: '...' }
              mensajeBackend = error.error.message;
            }
          } else if (error?.message) {
            mensajeBackend = error.message;
          }

          Swal.fire({
            title: 'Error de autenticación',
            text: mensajeBackend,
            icon: 'error'
          });
        }
      });
    } else {
      this.spinner.hide();
      this.isLoading = false;
      this.loginForm.markAllAsTouched();
      Swal.fire({
        title: 'Error',
        text: 'Por favor complete todos los campos requeridos',
        icon: 'error'
      });
    }
  }

  // =========================
  //   OLVIDÉ MI CONTRASEÑA
  // =========================
  onForgotPassword(event: Event) {
    event.preventDefault();

    Swal.fire({
      title: 'Recuperar contraseña',
      text: 'Ingrese su nombre de usuario para recuperar su contraseña',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off',
        placeholder: 'Nombre de usuario'
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      const username = result.value;

      if (!username) {
        Swal.fire({
          title: 'Dato requerido',
          text: 'Debe ingresar el nombre de usuario.',
          icon: 'warning'
        });
        return;
      }

      this.titleSpinner = 'Procesando recuperación...';
      this.spinner.show();

      this.loginService.recuperarContrasena(username).subscribe({
        next: (resp) => {
          this.spinner.hide();

          Swal.fire({
            title: 'Recuperación de contraseña',
            text: resp?.mensaje || 'Si el usuario existe, se enviará un correo con instrucciones.',
            icon: 'info'
          });
        },
        error: (error) => {
          console.error('Error en recuperación de contraseña:', error);
          this.spinner.hide();

          // Mensaje genérico, sin revelar si el usuario existe o no
          Swal.fire({
            title: 'Recuperación de contraseña',
            text: 'Si el usuario existe, se enviará un correo con instrucciones.',
            icon: 'info'
          });
        }
      });
    });
  }
}



