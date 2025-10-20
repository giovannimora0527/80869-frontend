import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from 'src/app/services/backend.service'; 
import { environment } from 'src/environments/environment';
import { Recetas } from '../models/recetas'; 

@Injectable({
  providedIn: 'root'
})
export class RecetasService {
  apiUrl = environment.apiUrl;
  endpoint = 'recetas';

  constructor(private readonly backendService: BackendService) {}


  listarRecetas(): Observable<Recetas[]> {   
    return this.backendService.get(this.apiUrl, this.endpoint, 'listar');
  }
  

}
