export class MedicamentoRq {
  id?: number; // opcional, para editar
  nombre!: string;
  descripcion!: string;
  presentacion!: string;
  fechaCompra!: string; // formato: yyyy-MM-dd
  fechaVence!: string;
}