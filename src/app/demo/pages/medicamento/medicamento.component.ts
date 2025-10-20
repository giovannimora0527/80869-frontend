import { Component } from '@angular/core';
import { MedicamentoService } from './service/medicamento.service';
import { Medicamento } from './models/medicamento';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-medicamento',
  imports: [CommonModule],
  templateUrl: './medicamento.component.html',
  styleUrls: ['./medicamento.component.scss']
})
export class MedicamentoComponent {
  medicamentoList: Medicamento[] = [];
  constructor(private readonly medicamentoService: MedicamentoService) {
    this.listarMedicamentos();
  }

  listarMedicamentos() {
    this.medicamentoService.listarMedicamentos().subscribe({
      next: (data) => {
        console.log(data);
        this.medicamentoList = data;
      },
      error: (error) => {
        console.error('Error fetching medicamentos:', error);
      }
    });
  }

  probarBoton(medicamento: Medicamento) {
    console.log(medicamento);
  }
}
