export class Paciente {
    id!: number;
    tipoDocumento!: string;
    numeroDocumento!: string;
    nombres!: string;
    apellidos!: string;
    telefono!: string;
    direccion!: string;
    fechaNacimiento!: string; // Como string para manejar fechas del backend
    genero!: string;
}