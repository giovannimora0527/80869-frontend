import { Paciente } from "../../paciente/models/paciente";
import { Medico } from "../../medico/models/medico";

export class Cita {
    id!: number;
    paciente!: Paciente;     // Relación con el paciente
    medico!: Medico;         // Relación con el médico
    fechaHora!: string;      // Se maneja como string para compatibilidad con Angular forms
    estado!: string;
    motivo!: string;
}
