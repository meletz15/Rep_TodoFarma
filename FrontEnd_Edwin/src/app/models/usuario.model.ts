export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol_id: number;
  rol_nombre?: string;
  rol?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  fecha_registro: string;
}

export interface UsuarioCreate {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  rol_id: number;
  estado?: 'ACTIVO' | 'INACTIVO';
}

export interface UsuarioUpdate {
  nombre?: string;
  apellido?: string;
  correo?: string;
  contrasena?: string;
  rol_id?: number;
  estado?: 'ACTIVO' | 'INACTIVO';
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  ok: boolean;
  mensaje: string;
  datos: {
    token: string;
    usuario: {
      id_usuario: number;
      nombre: string;
      apellido: string;
      correo: string;
      rol: string;
    };
  };
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
