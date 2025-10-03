import { Component } from '@angular/core';
import { UsuarioService } from './service/usuario.service';
import { Usuario } from './models/usuario';
import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';
// Importa los objetos necesarios de Bootstrap
import Modal from 'bootstrap/js/dist/modal';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule],
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

  constructor(private readonly usuarioService: UsuarioService) {
    this.listarUsuarios();
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
  }

  abrirNuevoUsuario() {
    this.usuarioSelected = new Usuario();
    // Cargamos los datos del usuario seleccionado en el formulario

    // Dejamos el formulario en blanco
    this.openModal('C');
  }

  abrirEditarUsuario(usuario: Usuario) {
    this.usuarioSelected = usuario;
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
    Swal.fire("Titulo", "Guardando usuario...", "info");
  }



}
