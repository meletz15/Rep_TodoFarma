export interface UnidadMedida {
  id_unidad_medida: number;
  nombre: string;
  simbolo: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnidadMedidaCreate {
  nombre: string;
  simbolo: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UnidadMedidaUpdate {
  nombre?: string;
  simbolo?: string;
  descripcion?: string;
  activo?: boolean;
}

