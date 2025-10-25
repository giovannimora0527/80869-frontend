import { Especializacion } from "src/app/demo/pages/especializacion/models/especializacion";


export class Medico {
  id!: number;
  tipoDocumento!: string;
  documento!: string;
  nombres!: string;
  apellidos!: string;
  telefono!: string;
  registroProfesional!: string;
  especializacion!: Especializacion;
}
