export interface Rol {
  id_rol: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion: string;
  permisos: { [key: string]: boolean };
}

export interface RolCreate {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  permisos?: { [key: string]: boolean };
}

export interface RolUpdate {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  permisos?: { [key: string]: boolean };
}

