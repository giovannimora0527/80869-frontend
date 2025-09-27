import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service';
import { environment } from 'src/environments/environment';
import { Usuario } from '../models/usuario'

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
}
