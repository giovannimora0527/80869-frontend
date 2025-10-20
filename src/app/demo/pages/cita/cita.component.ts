import { Component } from '@angular/core';
import { CitaService } from './service/cita.service';
import { Cita } from './models/cita';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cita',
  imports: [CommonModule],
  templateUrl: './cita.component.html',
  styleUrls: ['./cita.component.scss']
})
export class CitaComponent {
  citaList: Cita[] = [];
  constructor(private readonly citaService: CitaService) {
    this.listarCitas();
  }

  listarCitas() {
    this.citaService.listarCitas().subscribe({
      next: (data) => {
        console.log(data);
        this.citaList = data;
      },
      error: (error) => {
        console.error('Error fetching citas:', error);
      }
    });
  }

  probarBoton(cita: Cita) {
    console.log(cita);
  }
}
