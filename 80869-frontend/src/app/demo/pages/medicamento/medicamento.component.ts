import { Component } from '@angular/core';

@Component({
  selector: 'app-medicamento',
  templateUrl: './medicamento.component.html',
  styleUrls: ['./medicamento.component.scss']
})
export class MedicamentoComponent {
  busquedaMedicamento: string = '';
  medicamentoList: any[] = [];

  buscarMedicamentos() {
    // Aquí deberías filtrar medicamentoList según busquedaMedicamento
    // Por ejemplo, si tienes un servicio, llama al método de búsqueda
  }

  limpiarBusqueda() {
    this.busquedaMedicamento = '';
    // Restablece la lista de medicamentos
  }

  abrirNuevoMedicamento() {
    // Lógica para abrir modal o formulario de nuevo medicamento
  }
}
