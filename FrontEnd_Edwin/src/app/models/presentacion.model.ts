export interface Presentacion {
  id_presentacion: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PresentacionCreate {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface PresentacionUpdate {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

