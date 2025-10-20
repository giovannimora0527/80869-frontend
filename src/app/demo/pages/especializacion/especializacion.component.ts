import { Component } from '@angular/core';
import { EspecialidadService } from './service/especialidad.service';
import { Especialidad } from './models/especialidad';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-especialidad',
  imports: [CommonModule],
  templateUrl: './especialidad.component.html',
  styleUrl: './especialidad.component.scss'
})
export class EspecialidadComponent {
  especialidadList: Especialidad[] = [];
  constructor(private readonly especialidadService: EspecialidadService) {
  }


  probarBoton(especialidad: Especialidad) {
    console.log(especialidad);
  }
}
