import { Medicamento } from '../../medicamentos/models/medicamento.model';

// Modelo mínimo de Cita
export interface Cita {
  id: number;
  // ...otros campos si los necesitas
}

export class Receta {
    id!: number;
    cita!: Cita;
    medicamento!: Medicamento;
    dosis!: string;
    indicaciones!: string;
    fechaCreacionRegistro!: Date;
}









