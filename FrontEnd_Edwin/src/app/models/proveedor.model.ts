export interface Proveedor {
  id: number;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  correo: string;
  empresa: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface ProveedorCreate {
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  correo: string;
  empresa: string;
  estado?: 'ACTIVO' | 'INACTIVO';
}

export interface ProveedorUpdate {
  nombre?: string;
  apellido?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  empresa?: string;
  estado?: 'ACTIVO' | 'INACTIVO';
}

export interface ApiResponse<T> {
  ok: boolean;
  mensaje: string;
  datos: T;
}

export interface PaginatedResponse<T> {
  datos: T[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    total_paginas: number;
  };
}