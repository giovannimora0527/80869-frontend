import { Component } from '@angular/core';
import { UsuarioService } from './service/usuario.service';
import { Usuario } from './models/usuario';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss'
})
export class UsuarioComponent {

  usuarioList: Usuario[] = [];

  constructor(private readonly usuarioService: UsuarioService) {
    this.listarUsuarios();
  }
  listarUsuarios() {
    this.usuarioService.listarUsuarios().subscribe({
      next: (data) => {        
        this.usuarioList = data;
        console.log(this.usuarioList);
      },
      error: (error) => {
        console.error('Error fetching users:', error);       
      }
    });
  }

  probarBoton(usuario: Usuario) {   
    console.log("Selecciono este usuario");
    console.log(usuario);
  }
}
