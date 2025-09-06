import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Producto, 
  ProductoCreate, 
  ProductoUpdate, 
  ProductoEstadisticas,
  ApiResponse, 
  PaginatedResponse 
} from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  // Obtener productos con paginación y filtros
  obtenerProductos(pagina: number = 1, limite: number = 10, filtros?: any): Observable<ApiResponse<PaginatedResponse<Producto>>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (filtros) {
      if (filtros.activo !== undefined && filtros.activo !== '') {
        params = params.set('activo', filtros.activo);
      }
      if (filtros.id_categoria !== undefined && filtros.id_categoria !== '') {
        params = params.set('id_categoria', filtros.id_categoria);
      }
      if (filtros.busqueda && filtros.busqueda.trim() !== '') {
        params = params.set('busqueda', filtros.busqueda.trim());
      }
    }

    return this.http.get<ApiResponse<PaginatedResponse<Producto>>>(this.apiUrl, { params });
  }

  // Obtener producto por ID
  obtenerProducto(id: number): Observable<ApiResponse<Producto>> {
    return this.http.get<ApiResponse<Producto>>(`${this.apiUrl}/${id}`);
  }

  // Crear nuevo producto
  crearProducto(producto: ProductoCreate): Observable<ApiResponse<Producto>> {
    return this.http.post<ApiResponse<Producto>>(this.apiUrl, producto);
  }

  // Actualizar producto
  actualizarProducto(id: number, producto: ProductoUpdate): Observable<ApiResponse<Producto>> {
    return this.http.put<ApiResponse<Producto>>(`${this.apiUrl}/${id}`, producto);
  }

  // Eliminar producto
  eliminarProducto(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  // Obtener estadísticas de productos
  obtenerEstadisticasProductos(): Observable<ApiResponse<ProductoEstadisticas>> {
    return this.http.get<ApiResponse<ProductoEstadisticas>>(`${this.apiUrl}/estadisticas`);
  }

  // Obtener productos por rango de fechas
  obtenerProductosPorRangoFechas(desde: string, hasta: string): Observable<ApiResponse<Producto[]>> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get<ApiResponse<Producto[]>>(`${this.apiUrl}/rango-fechas`, { params });
  }
}
