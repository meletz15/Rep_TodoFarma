export interface InventarioMovimiento {
  id_mov: number;
  producto_id: number;
  fecha: string;
  tipo: 'ENTRADA_COMPRA' | 'SALIDA_VENTA' | 'AJUSTE_ENTRADA' | 'AJUSTE_SALIDA' | 'DEVOLUCION_COMPRA' | 'DEVOLUCION_CLIENTE';
  cantidad: number;
  signo: number;
  referencia?: string;
  pedido_id?: number;
  venta_id?: number;
  usuario_id?: number;
  observacion?: string;
  created_at: string;
  producto_nombre?: string;
  sku?: string;
  codigo_barras?: string;
  usuario_nombre?: string;
}

export interface KardexProducto {
  id_mov: number;
  fecha: string;
  tipo: string;
  cantidad: number;
  signo: number;
  referencia?: string;
  pedido_id?: number;
  venta_id?: number;
  usuario_id?: number;
  observacion?: string;
  created_at: string;
  usuario_nombre?: string;
  stock_anterior: number;
  stock_actual: number;
}

export interface MovimientoCreate {
  producto_id: number;
  tipo: 'AJUSTE_ENTRADA' | 'AJUSTE_SALIDA' | 'DEVOLUCION_COMPRA' | 'DEVOLUCION_CLIENTE';
  cantidad: number;
  signo: number;
  referencia?: string;
  usuario_id?: number;
  observacion?: string;
}

export interface InventarioEstadisticas {
  productos_con_movimientos: number;
  total_movimientos: number;
  entradas_compra: number;
  salidas_venta: number;
  ajustes_entrada: number;
  ajustes_salida: number;
  devoluciones_compra: number;
  devoluciones_cliente: number;
  movimientos_ultimo_mes: number;
  total_entradas: number;
  total_salidas: number;
}

export interface ProductoStockBajo {
  id_producto: number;
  nombre: string;
  sku?: string;
  stock: number;
  precio_unitario: number;
  categoria_nombre: string;
  marca_nombre: string;
}

export interface ProductoPorVencer {
  id_producto: number;
  nombre: string;
  sku?: string;
  stock: number;
  fecha_vencimiento: string;
  precio_unitario: number;
  categoria_nombre: string;
  marca_nombre: string;
  dias_para_vencer: number;
}

export interface ResumenCategoria {
  id_categoria: number;
  categoria_nombre: string;
  total_productos: number;
  productos_activos: number;
  stock_total: number;
  valor_total: number;
}

export interface InventarioFiltros {
  producto_id?: number;
  tipo?: string;
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
