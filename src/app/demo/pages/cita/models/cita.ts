import { Medico } from "../../medico/models/medico";
import { Paciente } from "../../paciente/models/paciente";


export class Cita {
    id!: number;
    fechaHora!: string;
    motivo!: string;
    estado!: string;
    paciente!: Paciente;
    medico!: Medico;
}
