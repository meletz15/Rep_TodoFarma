export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CategoriaUpdate {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CategoriaEstadisticas {
  total_categorias: number;
  categorias_activas: number;
  categorias_inactivas: number;
  nuevas_ultimo_mes: number;
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
