export class FormulaMedicaRq {
  id?: number;
  pacienteId!: number;
  medicoId!: number;
  fecha!: string; // yyyy-MM-dd
  detalles!: string;
}
