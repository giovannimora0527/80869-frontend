import { Cita } from 'src/app/demo/pages/cita/models/cita';
import { Medicamento } from 'src/app/demo/pages/medicamento/models/medicamento';

export class Receta {
    id!: number;
    cita!: Cita;
    medicamento!: Medicamento;
    dosis!: string;
    indicaciones!: string;
    fechaCreacionRegistro!: Date;
}
