import { Component } from '@angular/core';
import { HistorialService } from './service/historial.service';
import { Historial } from './models/historial';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historial',
  imports: [CommonModule],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.scss'
})
export class HistorialComponent {
  historialList: Historial[] = [];
  constructor(private readonly historialService: HistorialService) {
    this.listarHistorial();
  }

  listarHistorial() {
    this.historialService.listarHistorial().subscribe({
      next: (data) => {
        console.log(data);
        this.historialList = data;
      },
      error: (error) => {
        console.error('Error fetching historial:', error);
      }
    });
  }

  probarBoton(historial: Historial) {
    console.log(historial);
  }
}
