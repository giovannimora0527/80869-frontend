export class MedicoRq {
    tipoDocumento!: string; // El tipo de documento es obligatorio
    numeroDocumento!: string; // El número de documento es obligatorio
    nombres!: string; // Los nombres son obligatorios
    apellidos!: string; // Los apellidos son obligatorios
    telefono!: string; // El teléfono es obligatorio
    registroProfesional!: string; // El registro profesional es obligatorio
    especializacion!: number; // La especialización es obligatoria
}