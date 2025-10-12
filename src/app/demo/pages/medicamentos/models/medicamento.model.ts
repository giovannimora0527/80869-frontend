export class Medicamento {
  id?: number;
  nombre!: string;
  descripcion?: string;
  presentacion?: string;
  concentracion?: string;
  stock?: number;
  precio?: number;
  fecha_compra?: Date;
  fecha_vencimiento?: Date;
  fecha_creacion_registro?: Date;
  fecha_modificacion_registro?: Date;
}
