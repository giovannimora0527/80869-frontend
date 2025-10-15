import { Component } from '@angular/core';
import { RecetaService } from './service/receta.service';
import { Receta } from './models/receta';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-receta',
  imports: [CommonModule],
  templateUrl: './receta.component.html',
  styleUrl: './receta.component.scss'
})
export class RecetaComponent {
  recetaList: Receta[] = [];

  constructor(private readonly recetaService: RecetaService) {
    this.listarRecetas();
  }

  listarRecetas() {
    this.recetaService.listarRecetas().subscribe({
      next: (data) => {
        this.recetaList = data;
      },
      error: (error) => {
        console.error('Error fetching recetas:', error);
      }
    });
  }
}