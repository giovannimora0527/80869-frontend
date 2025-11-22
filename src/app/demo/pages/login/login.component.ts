import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { LoginService } from './service/login.service';
import { RecuperarPasswordService } from 'src/app/services/recuperar-password.service';
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
    private readonly recuperarPasswordService: RecuperarPasswordService,
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
          localStorage.setItem("token", response.token)
          this.isLoading = false;
          this.spinner.hide();
          Swal.fire({
            title: 'Éxito',
            text: 'Inicio de sesión exitoso',
            icon: 'success'
          }).then(() => {
            // Aquí redirigirías al usuario al dashboard
            console.log('Redirigir al dashboard');
            this.isLoading = false;
            this.router.navigate(['/inicio']);
          });
        },
        error: (error) => {
          this.spinner.hide();
          this.isLoading = false;
          console.error('Error en la autenticación:', error);
          const msg = error?.error?.message || error?.error?.mensaje || error?.message || 'Ups! Algo salió mal durante el inicio de sesión.';
          Swal.fire({
            title: 'Error',
            text: msg,
            icon: 'error'
          });
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

  onForgotPassword(event: Event) {
    event.preventDefault();

    // Paso 1: Solicitar el nombre de usuario
    Swal.fire({
      title: 'Recuperar contraseña',
      text: 'Ingrese su nombre de usuario',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off',
        placeholder: 'Nombre de usuario'
      },
      showCancelButton: true,
      confirmButtonText: 'Solicitar código',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: (username) => {
        if (!username) {
          Swal.showValidationMessage('El nombre de usuario es requerido');
          return false;
        }
        // Llamar al servicio para solicitar el código
        return this.recuperarPasswordService.solicitarCodigo(username).toPromise()
          .then((response) => {
            return username; // Retornar el username para usarlo en el siguiente paso
          })
          .catch((error) => {
            Swal.showValidationMessage('Error al solicitar el código de verificación.');
            return false;
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const username = result.value;
        
        // Paso 2: Mostrar formulario para ingresar código y nueva contraseña
        Swal.fire({
          title: 'Verificar código',
          html: `
            <p>Se ha enviado un código de verificación a tu correo electrónico.</p>
            <input id="codigo" class="swal2-input" placeholder="Código de 6 dígitos" maxlength="6" type="text" style="width: 80%;">
            <input id="nuevaPassword" class="swal2-input" placeholder="Nueva contraseña" type="password" style="width: 80%;">
            <input id="confirmarPassword" class="swal2-input" placeholder="Confirmar contraseña" type="password" style="width: 80%;">
          `,
          showCancelButton: true,
          confirmButtonText: 'Cambiar contraseña',
          cancelButtonText: 'Cancelar',
          focusConfirm: false,
          showLoaderOnConfirm: true,
          preConfirm: () => {
            const codigo = (document.getElementById('codigo') as HTMLInputElement).value;
            const nuevaPassword = (document.getElementById('nuevaPassword') as HTMLInputElement).value;
            const confirmarPassword = (document.getElementById('confirmarPassword') as HTMLInputElement).value;

            if (!codigo) {
              Swal.showValidationMessage('El código es requerido');
              return false;
            }
            if (codigo.length !== 6) {
              Swal.showValidationMessage('El código debe tener 6 dígitos');
              return false;
            }
            if (!nuevaPassword) {
              Swal.showValidationMessage('La nueva contraseña es requerida');
              return false;
            }
            if (nuevaPassword.length < 6) {
              Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
              return false;
            }
            if (nuevaPassword !== confirmarPassword) {
              Swal.showValidationMessage('Las contraseñas no coinciden');
              return false;
            }

            // Llamar al servicio para verificar el código y cambiar la contraseña
            return this.recuperarPasswordService.verificarCodigo(username, codigo, nuevaPassword).toPromise()
              .then((response) => {
                return true;
              })
              .catch((error) => {
                const mensaje = error.error?.mensaje || 'Código inválido o expirado';
                Swal.showValidationMessage(mensaje);
                return false;
              });
          },
          allowOutsideClick: () => !Swal.isLoading()
        }).then((verifyResult) => {
          if (verifyResult.isConfirmed) {
            Swal.fire({
              title: '¡Éxito!',
              text: 'Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          }
        });
      }
    });
  }
}
