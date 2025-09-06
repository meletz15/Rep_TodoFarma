export interface Cliente {
  id_cliente: number;
  nombres: string;
  apellidos?: string;
  nit?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  observaciones?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClienteCreate {
  nombres: string;
  apellidos?: string;
  nit?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  observaciones?: string;
  activo?: boolean;
}

export interface ClienteUpdate {
  nombres?: string;
  apellidos?: string;
  nit?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  observaciones?: string;
  activo?: boolean;
}

export interface ClienteEstadisticas {
  total_clientes: number;
  clientes_activos: number;
  clientes_inactivos: number;
  nuevos_ultimo_mes: number;
  clientes_con_nit: number;
  clientes_con_email: number;
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
