import { Component } from '@angular/core';
import { MedicoService } from './service/medico.service';
import { Medico } from './models/medico';
import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-medico',
  imports: [CommonModule],
  templateUrl: './medico.component.html',
  styleUrl: './medico.component.scss'
})
export class MedicoComponent {

  medicoList: Medico[] = [];

  constructor(private readonly medicoService: MedicoService) {
    this.listarMedicos();
  }

  listarMedicos() {
    this.medicoService.listarMedicos().subscribe({
      next: (data) => {
        this.medicoList = data;
        console.log(this.medicoList);
      },
      error: (error) => {
        console.error('Error fetching medicos:', error);
      }
    });
  }

  probarBoton(medico: Medico) {   
    Swal.fire("Prueba Alert", "Contenido del alert.", "warning");
    console.log("Selecciono este medico");
    console.log(medico);
  }

  guardarMedico() {
     Swal.fire("Guardando medico", "Esta usando la funcion guardar medico.", "info");
  }

}
