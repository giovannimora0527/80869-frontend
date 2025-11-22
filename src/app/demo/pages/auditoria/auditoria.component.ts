import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { AuditoriaService } from 'src/app/services/auditoria.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.scss']
})
export class AuditoriaComponent implements OnInit {
  usuarioControl = new FormControl('');
  exitoControl = new FormControl('');
  startControl = new FormControl('');
  endControl = new FormControl('');
  page = 0;
  size = 20;
  resultados: any[] = [];
  totalElements = 0;
  fechaError: string = '';
  loading = false;
  pageSizes = [10, 20, 50];
  // Material table
  displayedColumns: string[] = ['usuario', 'fechaHora', 'ip', 'resultado', 'motivo'];
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  // Nuevas propiedades para diseño moderno
  estadisticas = { exitos: 0, fallos: 0 };
  Math = Math; // Para usar Math.min en el template

  constructor(private auditoriaService: AuditoriaService) {}

  ngOnInit(): void {
    // Suscribirse a cambios en filtros para buscar automáticamente con debounce
    this.usuarioControl.valueChanges.pipe(debounceTime(350)).subscribe(() => { this.page = 0; this.buscar(); });
    this.exitoControl.valueChanges.pipe(debounceTime(350)).subscribe(() => { this.page = 0; this.buscar(); });
    this.startControl.valueChanges.pipe(debounceTime(350)).subscribe(() => { this.page = 0; this.buscar(); });
    this.endControl.valueChanges.pipe(debounceTime(350)).subscribe(() => { this.page = 0; this.buscar(); });
    this.buscar();
  }

  ngAfterViewInit(): void {
    // Assign paginator to datasource (useful if client-side); for server-side we'll still control page through events
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  buscar() {
    // Validar fechas: si ambas están presentes, end no puede ser menor que start
    this.fechaError = '';
    const startVal = this.startControl.value;
    const endVal = this.endControl.value;
    if (startVal && endVal) {
      const s = new Date(startVal);
      const e = new Date(endVal);
      if (e.getTime() < s.getTime()) {
        this.fechaError = 'La fecha final no puede ser menor que la inicial.';
        return;
      }
    }

    // Normalizar formato para el backend: LocalDateTime.parse espera segundos (ISO_LOCAL_DATE_TIME)
    const normalize = (d: string | undefined) => {
      if (!d) return undefined;
      // datetime-local typically produces 'YYYY-MM-DDTHH:mm' or 'YYYY-MM-DDTHH:mm:ss'
      if (d.length === 16) return d + ':00';
      return d;
    };
    const params: any = {
      usuario: this.usuarioControl.value || undefined,
      exito: this.exitoControl.value === '' ? undefined : (this.exitoControl.value === 'true'),
      start: normalize(startVal) || undefined,
      end: normalize(endVal) || undefined,
      page: this.page,
      size: this.size
    };

    this.loading = true;
    this.auditoriaService.search(params).subscribe({
      next: (res) => {
        this.resultados = res.content || [];
        this.totalElements = res.totalElements || 0;
        // update material dataSource
        this.dataSource.data = this.resultados;
        // Calcular estadísticas
        this.calcularEstadisticas();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al buscar auditoría', err);
        this.loading = false;
        if (err && err.status === 403) {
          this.fechaError = 'Acceso denegado (403). Verifica que tu sesión tenga permisos o inicia sesión nuevamente.';
        }
      }
    });
  }

  calcularEstadisticas() {
    this.estadisticas.exitos = this.resultados.filter(r => r.resultado === true).length;
    this.estadisticas.fallos = this.resultados.filter(r => r.resultado === false).length;
  }

  limpiarFiltros() {
    this.usuarioControl.setValue('');
    this.exitoControl.setValue('');
    this.startControl.setValue('');
    this.endControl.setValue('');
    this.fechaError = '';
    this.page = 0;
    this.buscar();
  }

  cambiarPagina(delta: number) {
    this.page = Math.max(0, this.page + delta);
    this.buscar();
  }

  setPageSize(newSize: number) {
    this.size = Number(newSize);
    this.page = 0;
    this.buscar();
  }

  get totalPages(): number {
    return this.size > 0 ? Math.ceil((this.totalElements || 0) / this.size) : 0;
  }

  onPageEvent(e: PageEvent) {
    this.page = e.pageIndex;
    this.size = e.pageSize;
    this.buscar();
  }
}
