import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicamentosService, MedicamentoRs, MedicamentoRq } from './service/medicamentos.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-medicamentos',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, FormsModule],
	templateUrl: './medicamentos.component.html',
	styleUrls: ['./medicamentos.component.scss']
})
export class MedicamentosComponent {
	medicamentosList: MedicamentoRs[] = [];
	medicamentosListOriginal: MedicamentoRs[] = []; // Lista original sin filtrar

	// modal/ui
	titleModal = '';
	titleBoton = '';
	modoFormulario: 'C' | 'E' | '' = '';
	medicamentoSelected: MedicamentoRs | null = null;
	modalInstance: Modal | null = null;

	// form
	form!: FormGroup;
	guardando = false;

	// Variables para búsqueda
	busquedaNombre: string = '';
	busquedaPresentacion: string = '';

  // Variables para estados de carga
	cargandoMedicamentos = false;

	// Variables para ordenamiento
	ordenActual = {
		campo: '',
		direccion: 'asc' // 'asc' o 'desc'
	};	constructor(
		private readonly medicamentosService: MedicamentosService,
		private readonly fb: FormBuilder
	) {
		this.crearFormularioVacio();
		this.listarMedicamentos();
	}

	private crearFormularioVacio() {
		this.form = this.fb.group({
			nombre:        ['', [
				Validators.required, 
				Validators.maxLength(100),
				Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
			]],
			descripcion:   ['', [
				Validators.required,
				Validators.maxLength(500)
			]],
			presentacion:  ['', [
				Validators.required, 
				Validators.maxLength(100),
				Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]+$/)
			]],
			fechaCompra:   ['', [
				Validators.required
			]],
			fechaVence:    ['', [
				Validators.required
			]]
		});
	}

	// Getters para fácil acceso a los controles del formulario
	get nombre() {
		return this.form.get('nombre');
	}

	get descripcion() {
		return this.form.get('descripcion');
	}

	get presentacion() {
		return this.form.get('presentacion');
	}

	get fechaCompra() {
		return this.form.get('fechaCompra');
	}

	get fechaVence() {
		return this.form.get('fechaVence');
	}

	listarMedicamentos() {
		this.cargandoMedicamentos = true;
		this.medicamentosService.listarMedicamentos().subscribe({
			next: (data) => {
				this.medicamentosListOriginal = data;
				this.medicamentosList = [...data];
			},
			error: (error) => {
				console.error('Error fetching medicamentos list:', error);
				Swal.fire('Error', 'No se pudieron cargar los medicamentos.', 'error');
			},
			complete: () => {
				this.cargandoMedicamentos = false;
			}
		});
	}

	abrirNuevoMedicamento() {
		this.titleModal = 'Crear Medicamento';
		this.titleBoton = 'Guardar Medicamento';
		this.modoFormulario = 'C';
		this.medicamentoSelected = null;

		this.form.reset();
		this.form.enable();
		this.abrirModal();
	}

	editarModalMedicamento(medicamento: MedicamentoRs) {
		this.titleModal = 'Editar Medicamento';
		this.titleBoton = 'Actualizar Medicamento';
		this.modoFormulario = 'E';
		this.medicamentoSelected = medicamento;

		this.form.patchValue({
			nombre: medicamento.nombre,
			descripcion: medicamento.descripcion,
			presentacion: medicamento.presentacion,
			fechaCompra: medicamento.fechaCompra,
			fechaVence: medicamento.fechaVence
		});
		this.form.enable();
		this.abrirModal();
	}

	abrirModal() {
		const el = document.getElementById('modalCrearMedicamento');
		if (!el) return;
		this.modalInstance ??= new Modal(el);
		this.modalInstance.show();

		el.addEventListener('hidden.bs.modal', () => {
			this.form.markAsPristine();
			this.form.markAsUntouched();
		}, { once: true });
	}

	closeModal() {
		this.modalInstance?.hide();
	}

	guardarMedicamento() {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			Swal.fire('Error', 'Por favor, corrige los errores en el formulario.', 'error');
			this.guardando = false;
			return;
		}

		this.guardando = true;

		const body: MedicamentoRq = {
			id: this.medicamentoSelected?.id || undefined,
			nombre: this.form.getRawValue().nombre?.trim(),
			descripcion: this.form.getRawValue().descripcion?.trim(),
			presentacion: this.form.getRawValue().presentacion?.trim(),
			fechaCompra: this.form.getRawValue().fechaCompra,
			fechaVence: this.form.getRawValue().fechaVence
		};

		const obs = this.modoFormulario === 'E'
			? this.medicamentosService.actualizarMedicamento(body)
			: this.medicamentosService.guardarMedicamento(body);

		obs.subscribe({
			next: (r) => {
				Swal.fire('Éxito', r?.mensaje || 'El medicamento se ha guardado correctamente.', 'success');
				this.closeModal();
				this.listarMedicamentos();
			},
			error: (e) => {
				console.error(e);
				const msg = e?.error?.message || e?.error || 'Error guardando el medicamento.';
				Swal.fire('Error', msg, 'error');
				this.guardando = false;
			},
			complete: () => {
				this.guardando = false;
			}
		});
	}

	/**
	 * Métodos para búsqueda de medicamentos
	 */
	buscarMedicamentos() {
		let listaFiltrada = [...this.medicamentosListOriginal];

		// Filtrar por nombre
		if (this.busquedaNombre && this.busquedaNombre.trim() !== '') {
			const nombreBusqueda = this.busquedaNombre.toLowerCase().trim();
			listaFiltrada = listaFiltrada.filter(medicamento => 
				medicamento.nombre.toLowerCase().includes(nombreBusqueda)
			);
		}

		// Filtrar por presentación
		if (this.busquedaPresentacion && this.busquedaPresentacion.trim() !== '') {
			const presentacionBusqueda = this.busquedaPresentacion.toLowerCase().trim();
			listaFiltrada = listaFiltrada.filter(medicamento => 
				medicamento.presentacion.toLowerCase().includes(presentacionBusqueda)
			);
		}

		this.medicamentosList = listaFiltrada;
	}

	limpiarBusqueda() {
		this.busquedaNombre = '';
		this.busquedaPresentacion = '';
		this.medicamentosList = [...this.medicamentosListOriginal];
	}

	/**
	 * Métodos para ordenamiento
	 */
	ordenarPor(campo: string) {
		// Si es el mismo campo, cambiar dirección, si no, ordenar ascendente
		if (this.ordenActual.campo === campo) {
			this.ordenActual.direccion = this.ordenActual.direccion === 'asc' ? 'desc' : 'asc';
		} else {
			this.ordenActual.campo = campo;
			this.ordenActual.direccion = 'asc';
		}

		this.medicamentosList.sort((a: any, b: any) => {
			let valorA = a[campo];
			let valorB = b[campo];

			// Manejar valores null/undefined
			if (valorA == null) valorA = '';
			if (valorB == null) valorB = '';

			// Si son números, convertir a número
			if (campo === 'id') {
				valorA = Number(valorA);
				valorB = Number(valorB);
			} else if (campo === 'fechaCompra' || campo === 'fechaVence') {
				// Para fechas, convertir a Date
				valorA = new Date(valorA);
				valorB = new Date(valorB);
			} else {
				// Para strings, convertir a minúsculas para comparación
				valorA = valorA.toString().toLowerCase();
				valorB = valorB.toString().toLowerCase();
			}

			let resultado = 0;
			if (valorA < valorB) {
				resultado = -1;
			} else if (valorA > valorB) {
				resultado = 1;
			}

			// Para números (como ID), ordenar de mayor a menor por defecto
			if (campo === 'id') {
				return this.ordenActual.direccion === 'asc' ? -resultado : resultado;
			} else {
				// Para texto y fechas, ordenar de A a Z por defecto
				return this.ordenActual.direccion === 'asc' ? resultado : -resultado;
			}
		});
	}

	getIconoOrden(campo: string): string {
		if (this.ordenActual.campo !== campo) {
			return 'fa fa-sort'; // Icono neutro
		}
		return this.ordenActual.direccion === 'asc' ? 'fa fa-sort-up' : 'fa fa-sort-down';
	}
}
