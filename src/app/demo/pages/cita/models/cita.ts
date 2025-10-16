export class Cita {
  id!: number;
  fechaHora!: string; // ISO datetime
  pacienteId!: number;
  medicoId!: number;
  estado!: string;
  motivo!: string;
}
