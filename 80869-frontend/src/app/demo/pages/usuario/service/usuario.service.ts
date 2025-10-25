import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Usuario } from '../models/usuario';
import { RespuestaRs } from '../models/respuesta-rs';
import { HttpParams } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  urlBase = environment.apiUrl;
  endpoint: string = 'usuario';

  constructor(private readonly backendService: BackendService) {}

  listarUsuarios(): Observable<Usuario[]> {
    return this.backendService.get(this.urlBase, this.endpoint, 'listar');
  }

  guardarUsuario(usuario: Usuario): Observable<RespuestaRs> {
    return this.backendService.post(this.urlBase, this.endpoint, 'guardar', usuario);
  }

  actualizarUsuario(usuario: Usuario): Observable<RespuestaRs> {
    // POST a /usuario/actualizar
    return this.backendService.post(this.urlBase, this.endpoint, 'actualizar', usuario);
  }

  eliminarUsuario(id: number): Observable<RespuestaRs> {
    // DELETE a /usuario/eliminar?id=ID
    return this.backendService.delete(this.urlBase, this.endpoint, 'eliminar', { id });
  }

  buscarUsuarioPorNombre(nombre: string): Observable<Usuario> {
    const params = new HttpParams().set('nombre', nombre);
    return this.backendService.get<Usuario>(this.urlBase, this.endpoint, 'buscar-nombre', params);
  }

  listarUsuariosPorRol(rol: string): Observable<Usuario[]> {
    const params = new HttpParams().set('rol', rol);
    return this.backendService.get<Usuario[]>(this.urlBase, this.endpoint, 'listar-rol', params);
  }

  buscarUsuariosPorEstado(activo: number): Observable<Usuario[]> {
    const params = new HttpParams().set('activo', activo.toString());
    return this.backendService.get<Usuario[]>(this.urlBase, this.endpoint, 'buscar-estado', params);
  }
}

