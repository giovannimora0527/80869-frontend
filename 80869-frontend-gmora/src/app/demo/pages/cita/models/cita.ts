import { Paciente } from '../../paciente/models/paciente';
import { Medico } from '../../medico/models/medico';

export class Cita {
    id!: number;
    paciente!: Paciente;
    medico!: Medico;
    fechaHora!: string;
    estado!: string;
    motivo!: string;
    observaciones!: string;
}