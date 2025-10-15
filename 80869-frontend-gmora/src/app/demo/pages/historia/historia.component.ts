import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historia',
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="card">
        <div class="card-header">
          <h3 class="mb-0">
            <i class="fa fa-folder"></i>
            Historias Médicas
          </h3>
        </div>
        <div class="card-body">
          <p>Componente de historias médicas en desarrollo...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card { box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075); }
  `]
})
export class HistoriaComponent {}