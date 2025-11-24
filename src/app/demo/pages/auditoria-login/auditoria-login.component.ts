import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { AuditoriaLoginService } from 'src/app/models/auditoria-login.service';
import { AuditoriaLogin } from 'src/app/models/auditoria-login.model';

@Component({
  selector: 'app-auditoria-login',
  standalone: true,
  // 👇 IMPORTS necesarios para *ngIf, *ngFor, formGroup, date, etc.
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './auditoria-login.component.html',
  // 👇 tu archivo es .scss, no .css
  styleUrl: './auditoria-login.component.scss'
})
export class AuditoriaLoginComponent implements OnInit {

  filtrosForm!: FormGroup;
  logs: AuditoriaLogin[] = [];

  pageIndex = 0;      // página actual
  pageSize = 10;      // registros por página
  totalElements = 0;  // total de registros
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private auditoriaService: AuditoriaLoginService
  ) {}

  ngOnInit(): void {
    this.filtrosForm = this.fb.group({
      username: [''],
      fechaDesde: [''],
      fechaHasta: ['']
    });

    // recarga “en tiempo real” cuando cambian los filtros
    this.filtrosForm.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.pageIndex = 0;
        this.cargarLogs();
      });

    this.cargarLogs();
  }

  cargarLogs(): void {
    this.cargando = true;

    const valores = this.filtrosForm.value;

    const fechaDesde = valores.fechaDesde
      ? new Date(valores.fechaDesde).toISOString()
      : undefined;

    const fechaHasta = valores.fechaHasta
      ? new Date(valores.fechaHasta).toISOString()
      : undefined;

    this.auditoriaService.getLogs(
      {
        username: valores.username || undefined,
        fechaDesde,
        fechaHasta
      },
      this.pageIndex,
      this.pageSize
    ).subscribe({
      next: (resp) => {
        this.logs = resp.content;
        this.totalElements = resp.totalElements;
        this.pageIndex = resp.number;
        this.pageSize = resp.size;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando auditoría:', err);
        this.cargando = false;
      }
    });
  }

  cambiarPagina(delta: number): void {
    const nuevaPagina = this.pageIndex + delta;

    if (nuevaPagina < 0) return;
    if ((nuevaPagina * this.pageSize) >= this.totalElements) return;

    this.pageIndex = nuevaPagina;
    this.cargarLogs();
  }
}



