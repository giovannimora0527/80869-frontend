import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MedicamentoRq {
	id?: number;
	nombre: string;
	descripcion: string;
	presentacion: string;
	fechaCompra: string; // formato yyyy-MM-dd
	fechaVence: string;  // formato yyyy-MM-dd
}

export interface MedicamentoRs {
	id: number;
	nombre: string;
	descripcion: string;
	presentacion: string;
	fechaCompra: string;
	fechaVence: string;
	fechaCreacionRegistro: string;
	fechaModificacionRegistro?: string;
}

export interface RespuestaRs {
	mensaje: string;
	status: number;
}

@Injectable({
	providedIn: 'root'
})
export class MedicamentosService {
	private readonly apiUrl = 'http://localhost:8000/clinica/v1/medicamento';

	constructor(private readonly http: HttpClient) {}

	listarMedicamentos(): Observable<MedicamentoRs[]> {
		return this.http.get<MedicamentoRs[]>(`${this.apiUrl}/listar`);
	}

	guardarMedicamento(medicamento: MedicamentoRq): Observable<RespuestaRs> {
		return this.http.post<RespuestaRs>(`${this.apiUrl}/guardar`, medicamento);
	}

	actualizarMedicamento(medicamento: MedicamentoRq): Observable<RespuestaRs> {
		return this.http.post<RespuestaRs>(`${this.apiUrl}/actualizar`, medicamento);
	}

	eliminarMedicamento(id: number): Observable<RespuestaRs> {
		return this.http.delete<RespuestaRs>(`${this.apiUrl}/eliminar/${id}`);
	}
}