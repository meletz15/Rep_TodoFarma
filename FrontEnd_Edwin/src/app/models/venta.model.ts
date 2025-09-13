export interface Venta {
  id_venta: number;
  fecha: string;
  cliente_id?: number;
  usuario_id: number;
  caja_id: number;
  estado: 'EMITIDA' | 'ANULADA';
  total: number;
  observacion?: string;
  created_at: string;
  updated_at: string;
  cliente_nombre?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  usuario_nombre: string;
  caja_fecha_apertura?: string;
  detalles?: VentaDetalle[];
}

export interface VentaDetalle {
  id_venta_det: number;
  id_venta: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto_nombre?: string;
  sku?: string;
  codigo_barras?: string;
}

export interface VentaCreate {
  cliente_id?: number;
  usuario_id: number;
  fecha?: string;
  estado?: 'EMITIDA' | 'ANULADA';
  total?: number;
  observacion?: string;
  detalles: VentaDetalleCreate[];
}

export interface VentaDetalleCreate {
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}

export interface VentaAnular {
  motivo?: string;
}

export interface VentaEstadisticas {
  total_ventas: number;
  ventas_emitidas: number;
  ventas_anuladas: number;
  ventas_ultimo_mes: number;
  ventas_hoy: number;
  total_ventas_monto: number;
  promedio_venta: number;
  ventas_hoy_monto: number;
  ingresos_totales: number;
  productos_vendidos: number;
}

export interface ProductoMasVendido {
  id_producto: number;
  nombre: string;
  sku?: string;
  codigo_barras?: string;
  total_vendido: number;
  veces_vendido: number;
  total_ingresos: number;
  precio_promedio: number;
}

export interface VentaFiltros {
  estado?: string;
  cliente_id?: number;
  usuario_id?: number;
  caja_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  busqueda?: string;
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
