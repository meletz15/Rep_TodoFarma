import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Venta, 
  VentaCreate, 
  VentaAnular, 
  VentaEstadisticas,
  ProductoMasVendido,
  VentaFiltros,
  ApiResponse, 
  PaginatedResponse 
} from '../models/venta.model';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}

  // Obtener ventas con paginación y filtros
  obtenerVentas(pagina: number = 1, limite: number = 10, filtros?: VentaFiltros): Observable<ApiResponse<PaginatedResponse<Venta>>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (filtros) {
      if (filtros.estado) {
        params = params.set('estado', filtros.estado);
      }
      if (filtros.cliente_id) {
        params = params.set('cliente_id', filtros.cliente_id.toString());
      }
      if (filtros.usuario_id) {
        params = params.set('usuario_id', filtros.usuario_id.toString());
      }
      if (filtros.caja_id) {
        params = params.set('caja_id', filtros.caja_id.toString());
      }
      if (filtros.fecha_desde) {
        params = params.set('fecha_desde', filtros.fecha_desde);
      }
      if (filtros.fecha_hasta) {
        params = params.set('fecha_hasta', filtros.fecha_hasta);
      }
      if (filtros.busqueda && filtros.busqueda.trim() !== '') {
        params = params.set('busqueda', filtros.busqueda.trim());
      }
    }

    return this.http.get<ApiResponse<PaginatedResponse<Venta>>>(this.apiUrl, { params });
  }

  // Obtener venta por ID
  obtenerVenta(id: number): Observable<ApiResponse<Venta>> {
    return this.http.get<ApiResponse<Venta>>(`${this.apiUrl}/${id}`);
  }

  // Crear nueva venta
  crearVenta(venta: VentaCreate): Observable<ApiResponse<Venta>> {
    return this.http.post<ApiResponse<Venta>>(this.apiUrl, venta);
  }

  // Anular venta
  anularVenta(id: number, motivo: VentaAnular): Observable<ApiResponse<Venta>> {
    return this.http.put<ApiResponse<Venta>>(`${this.apiUrl}/${id}/anular`, motivo);
  }

  // Obtener estadísticas de ventas
  obtenerEstadisticasVentas(): Observable<ApiResponse<VentaEstadisticas>> {
    return this.http.get<ApiResponse<VentaEstadisticas>>(`${this.apiUrl}/estadisticas`);
  }

  // Obtener ventas por rango de fechas
  obtenerVentasPorRangoFechas(desde: string, hasta: string): Observable<ApiResponse<Venta[]>> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get<ApiResponse<Venta[]>>(`${this.apiUrl}/rango-fechas`, { params });
  }

  // Obtener productos más vendidos
  obtenerProductosMasVendidos(limite: number = 10, fechaDesde?: string, fechaHasta?: string): Observable<ApiResponse<ProductoMasVendido[]>> {
    let params = new HttpParams().set('limite', limite.toString());

    if (fechaDesde) {
      params = params.set('fecha_desde', fechaDesde);
    }
    if (fechaHasta) {
      params = params.set('fecha_hasta', fechaHasta);
    }

    return this.http.get<ApiResponse<ProductoMasVendido[]>>(`${this.apiUrl}/productos-mas-vendidos`, { params });
  }
}
