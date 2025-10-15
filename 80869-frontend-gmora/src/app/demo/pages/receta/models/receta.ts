import { Cita } from '../../cita/models/cita';
import { Medicamento } from '../../medicamento/models/medicamento';

export class Receta {
    id!: number;
    cita!: Cita;
    fechaReceta!: string;
    diagnostico!: string;
    observaciones!: string;
    medicamentos!: RecetaMedicamento[];
}

export class RecetaMedicamento {
    id!: number;
    medicamento!: Medicamento;
    dosis!: string;
    frecuencia!: string;
    duracion!: string;
    instrucciones!: string;
}