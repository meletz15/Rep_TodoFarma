export interface Caja {
  id_caja: number;
  fecha_apertura: string;
  usuario_apertura: number;
  saldo_inicial: number;
  estado: 'ABIERTO' | 'CERRADO';
  fecha_cierre?: string;
  usuario_cierre?: number;
  saldo_cierre?: number;
  observacion?: string;
  created_at: string;
  updated_at: string;
  usuario_nombre?: string;
  usuario_cierre_nombre?: string;
  estadisticas?: CajaEstadisticas;
  ventas?: VentaCaja[];
}

export interface CajaEstadisticas {
  total_ventas: number;
  total_ventas_monto: number;
  promedio_venta: number;
  saldo_actual: number;
}

export interface VentaCaja {
  id_venta: number;
  fecha: string;
  total: number;
  estado: string;
  observacion?: string;
  cliente_nombre?: string;
  usuario_nombre: string;
}

export interface CajaCreate {
  usuario_apertura: number;
  saldo_inicial?: number;
  observacion?: string;
}

export interface CajaCerrar {
  usuario_cierre?: number;
  observacion?: string;
}

export interface CajaEstadisticasGenerales {
  total_cajas: number;
  cajas_abiertas: number;
  cajas_cerradas: number;
  cajas_ultimo_mes: number;
  total_ingresos: number;
  promedio_ingresos_por_caja: number;
}

export interface ResumenDia {
  id_caja: number;
  fecha_apertura: string;
  saldo_inicial: number;
  saldo_cierre?: number;
  total_ventas: number;
  total_ventas_monto: number;
  promedio_venta: number;
}

export interface CajaFiltros {
  estado?: string;
  usuario_apertura?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
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
