import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  InventarioMovimiento, 
  KardexProducto,
  MovimientoCreate,
  InventarioEstadisticas,
  ProductoStockBajo,
  ProductoPorVencer,
  ResumenCategoria,
  InventarioFiltros,
  ConversionRequest,
  ConversionResponse,
  ApiResponse, 
  PaginatedResponse 
} from '../models/inventario.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = `${environment.apiUrl}/inventario`;

  constructor(private http: HttpClient) {}

  // Obtener movimientos de inventario con paginación y filtros
  obtenerMovimientos(pagina: number = 1, limite: number = 10, filtros?: InventarioFiltros): Observable<ApiResponse<PaginatedResponse<InventarioMovimiento>>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (filtros) {
      if (filtros.producto_id) {
        params = params.set('producto_id', filtros.producto_id.toString());
      }
      if (filtros.tipo) {
        params = params.set('tipo', filtros.tipo);
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

    return this.http.get<ApiResponse<PaginatedResponse<InventarioMovimiento>>>(`${this.apiUrl}/movimientos`, { params });
  }

  // Obtener kardex de un producto específico
  obtenerKardexProducto(idProducto: number, pagina: number = 1, limite: number = 10, filtros?: { fecha_desde?: string; fecha_hasta?: string }): Observable<ApiResponse<PaginatedResponse<KardexProducto>>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (filtros) {
      if (filtros.fecha_desde) {
        params = params.set('fecha_desde', filtros.fecha_desde);
      }
      if (filtros.fecha_hasta) {
        params = params.set('fecha_hasta', filtros.fecha_hasta);
      }
    }

    return this.http.get<ApiResponse<PaginatedResponse<KardexProducto>>>(`${this.apiUrl}/producto/${idProducto}/kardex`, { params });
  }

  // Crear movimiento de inventario manual
  crearMovimiento(movimiento: MovimientoCreate): Observable<ApiResponse<InventarioMovimiento>> {
    return this.http.post<ApiResponse<InventarioMovimiento>>(`${this.apiUrl}/movimiento`, movimiento);
  }

  // Obtener estadísticas de inventario
  obtenerEstadisticasInventario(): Observable<ApiResponse<InventarioEstadisticas>> {
    return this.http.get<ApiResponse<InventarioEstadisticas>>(`${this.apiUrl}/estadisticas`);
  }

  // Obtener productos con stock bajo
  obtenerProductosStockBajo(limiteStock: number = 10): Observable<ApiResponse<ProductoStockBajo[]>> {
    const params = new HttpParams().set('limite_stock', limiteStock.toString());
    return this.http.get<ApiResponse<ProductoStockBajo[]>>(`${this.apiUrl}/stock-bajo`, { params });
  }

  // Obtener productos próximos a vencer
  obtenerProductosPorVencer(dias: number = 30): Observable<ApiResponse<ProductoPorVencer[]>> {
    const params = new HttpParams().set('dias', dias.toString());
    return this.http.get<ApiResponse<ProductoPorVencer[]>>(`${this.apiUrl}/por-vencer`, { params });
  }

  // Obtener resumen de inventario por categoría
  obtenerResumenPorCategoria(): Observable<ApiResponse<ResumenCategoria[]>> {
    return this.http.get<ApiResponse<ResumenCategoria[]>>(`${this.apiUrl}/resumen-categoria`);
  }

  // Obtener lotes de un producto
  obtenerLotesProducto(idProducto: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/producto/${idProducto}/lotes`);
  }

  // Crear conversión de producto (ej: blister a pastillas sueltas)
  crearConversion(conversion: ConversionRequest): Observable<ApiResponse<ConversionResponse>> {
    return this.http.post<ApiResponse<ConversionResponse>>(`${this.apiUrl}/conversion`, conversion);
  }
}
