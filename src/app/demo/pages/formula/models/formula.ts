import { Cita } from "../../cita/models/cita";
import { Medicamento } from "../../medicamento/models/medicamento";

export class Formula {
    dosis!: string;
    indicaciones!: string;
    fechaCreacionRegistro!: Date;
    fechaModificacionRegistro!: Date;
    cita: Cita;
    medicamento: Medicamento;
}