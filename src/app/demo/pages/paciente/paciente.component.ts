import { Component } from '@angular/core';
import { PacienteService } from './service/paciente.service';
import { Paciente } from './models/paciente';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paciente',
  imports: [CommonModule],
  templateUrl: './paciente.component.html',
  styleUrl: './paciente.component.scss'
})
export class PacienteComponent {
  pacienteList: Paciente[] = [];
  constructor(private readonly pacienteService: PacienteService) {
    this.listarPacientes();
  }

  listarPacientes() {
    this.pacienteService.listarPacientes().subscribe({
      next: (data) => {
        console.log(data);
        this.pacienteList = data;
      },
      error: (error) => {
        console.error('Error fetching pacientes:', error);
      }
    });
  }

 probarBoton(paciente: Paciente) {   
    console.log(paciente);
 }

}
