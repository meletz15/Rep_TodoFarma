export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  sku?: string;
  codigo_barras?: string;
  id_categoria: number;
  id_marca: number;
  categoria_nombre?: string;
  marca_nombre?: string;
  precio_unitario: number;
  stock: number;
  fecha_vencimiento?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductoCreate {
  nombre: string;
  descripcion?: string;
  sku?: string;
  codigo_barras?: string;
  id_categoria: number;
  id_marca: number;
  precio_unitario?: number;
  stock?: number;
  fecha_vencimiento?: string;
  activo?: boolean;
}

export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string;
  sku?: string;
  codigo_barras?: string;
  id_categoria?: number;
  id_marca?: number;
  precio_unitario?: number;
  stock?: number;
  fecha_vencimiento?: string;
  activo?: boolean;
}

export interface ProductoEstadisticas {
  total_productos: number;
  productos_activos: number;
  productos_inactivos: number;
  nuevos_ultimo_mes: number;
  productos_sin_stock: number;
  productos_por_vencer: number;
  valor_total_inventario: number;
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
    totalPaginas: number;
    tieneSiguiente: boolean;
    tieneAnterior: boolean;
  };
}
