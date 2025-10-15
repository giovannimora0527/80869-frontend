import { Component } from '@angular/core';
import { UsuarioService } from './service/usuario.service';
import { Usuario } from './models/usuario';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors
} from '@angular/forms';

import Swal from 'sweetalert2';
// Importa los objetos necesarios de Bootstrap
import Modal from 'bootstrap/js/dist/modal';
import { delay, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss'
})
export class UsuarioComponent {
  modalInstance: Modal | null = null;
  modoFormulario: string = '';
  usuarios: Usuario[] = [];
  titleModal: string = '';
  titleBoton: string = '';
  usuarioSelected: Usuario;

  /**
   * Formulario para crear/editar usuario.
   */
  form: FormGroup = new FormGroup({
    username: new FormControl(''),
    pass: new FormControl(''),
    rol: new FormControl(''),
    activo: new FormControl('')
  });

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly formBuilder: FormBuilder
  ) {
    this.listarUsuarios();
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.form = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(12)]],
      pass: ['', [Validators.required, Validators.minLength(8)], [this.passwordAsyncValidator]],
      rol: ['', [Validators.required]],
      activo: ['']
    });
  }

  /**
   * Siempre va igual.
   */
  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  passwordAsyncValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    const contrasenasProhibidas = ['123456', 'password', 'admin'];

    return of(contrasenasProhibidas.includes(control.value)).pipe(
      delay(800), // simulamos llamada a servidor
      map((invalida) => (invalida ? { passwordProhibida: true } : null))
    );
  }

  listarUsuarios() {
    this.usuarioService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        console.log(this.usuarios);
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.usuarioSelected = new Usuario();
  }

  abrirNuevoUsuario() {
    this.usuarioSelected = new Usuario();  
    this.limpiarFormulario();
    // Dejamos el formulario en blanco
    this.openModal('C');
  }

  abrirEditarUsuario(usuario: Usuario) {    
    this.usuarioSelected = usuario;
    this.form.get("activo")?.setValue(this.usuarioSelected.activo);
    this.openModal('E');
  }

  openModal(modo: string) {
    this.titleModal = modo === 'C' ? 'Crear Usuario' : 'Editar Usuario';
    this.titleBoton = modo === 'C' ? 'Guardar Usuario' : 'Actualizar Usuario';
    this.modoFormulario = modo;
    const modalElement = document.getElementById('modalCrearUsuario');
    if (modalElement) {
      // Verificar si ya existe una instancia del modal
      this.modalInstance ??= new Modal(modalElement);
      this.modalInstance.show();
    }
  }

  guardarUsuario() {
    if (this.form.invalid) {
      Swal.fire("Error", "Por favor, corrija los errores en el formulario.", "error");
    }
    
    if (this.modoFormulario === 'C') {
      // Crear nuevo usuario
       this.usuarioService.crearUsuario(this.form.value)
       .subscribe({
        next: (data) => {
          Swal.fire("Éxito", data.mensaje, "success");
          this.listarUsuarios();
          this.closeModal();
        },
        error: (error) => {
          Swal.fire("Error", error.error.message, "error");
        }
      });
     
    } else {
      // Editar usuario existente
      const id = this.usuarioSelected.id!;
      const usuarioActualizado = { ...this.usuarioSelected, ...this.form.value };
      usuarioActualizado.id = id;
      console.log(usuarioActualizado);      
      this.usuarioService.editarUsuario(usuarioActualizado)
      .subscribe({
        next: (data) => {
          Swal.fire("Éxito", data.mensaje, "success");
          this.listarUsuarios();
          this.closeModal();
        },
        error: (error) => {
          Swal.fire("Error", error.error.message, "error");
        }
      });
    }

  }
}
