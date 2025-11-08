export interface Pedido {
  id_pedido: number;
  proveedor_id: number;
  usuario_id: number;
  fecha_pedido: string;
  estado: 'CREADO' | 'ENVIADO' | 'RECIBIDO' | 'CANCELADO';
  total_costo: number;
  observacion?: string;
  created_at: string;
  updated_at: string;
  proveedor_nombre?: string;
  usuario_nombre?: string;
  detalles?: PedidoDetalle[];
}

export interface PedidoDetalle {
  id_pedido_det: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  costo_unitario: number;
  subtotal: number;
  producto_nombre?: string;
  sku?: string;
  codigo_barras?: string;
}

export interface PedidoCreate {
  proveedor_id: number;
  usuario_id: number;
  fecha_pedido?: string;
  estado?: 'CREADO' | 'ENVIADO' | 'RECIBIDO' | 'CANCELADO';
  total_costo?: number;
  observacion?: string;
  detalles: PedidoDetalleCreate[];
}

export interface PedidoDetalleCreate {
  id_producto: number;
  cantidad: number;
  costo_unitario: number;
}

export interface PedidoUpdate {
  estado?: 'CREADO' | 'ENVIADO' | 'RECIBIDO' | 'CANCELADO';
  observacion?: string;
  detallesConFechas?: Array<{
    id_producto: number;
    fecha_vencimiento: string | null;
    numero_lote: string | null;
  }>;
}

export interface PedidoEstadisticas {
  total_pedidos: number;
  pedidos_creados: number;
  pedidos_enviados: number;
  pedidos_recibidos: number;
  pedidos_cancelados: number;
  pedidos_ultimo_mes: number;
  valor_total_pedidos: number;
}

export interface PedidoFiltros {
  estado?: string;
  proveedor_id?: number;
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
