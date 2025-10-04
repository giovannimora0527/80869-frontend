import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Usuario } from '../models/usuario'
import { RespuestRs } from '../models/respuestars';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  apiUrl = environment.apiUrl;
  endpoint = 'usuario';  

  constructor(private readonly backendService: BackendService) { }

  listarUsuarios(): Observable<Usuario[]> {
    return this.backendService.get(this.apiUrl, this.endpoint, 'listar');
  }

  crearUsuario(usuario: Usuario): Observable<RespuestRs> {   
    return this.backendService.post(this.apiUrl, this.endpoint, 'guardar', usuario);
  } 

  editarUsuario(usuario: Usuario): Observable<RespuestRs> {
    return this.backendService.post(this.apiUrl, this.endpoint, 'actualizar', usuario);
  }

}
