export interface InventarioMedicamento {
  id: number;
  cantidad: number;
  fechaIngreso: string;
  fechaVencimiento?: string | null;
  lote?: string | null;
  medicamento: Medicamento;
}

export interface Medicamento {
  id: number;
  nombre: string;
  descripcion?: string | null;
  presentacion?: string | null;
}

export interface InventarioMedicamentoRq {
  cantidad: number;
  fechaIngreso: string;
  fechaVencimiento?: string;
  lote?: string;
  medicamentoId: number;
}
