import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Pedido, 
  PedidoCreate, 
  PedidoUpdate, 
  PedidoEstadisticas,
  PedidoFiltros,
  ApiResponse, 
  PaginatedResponse 
} from '../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  // Obtener pedidos con paginación y filtros
  obtenerPedidos(pagina: number = 1, limite: number = 10, filtros?: PedidoFiltros): Observable<ApiResponse<PaginatedResponse<Pedido>>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (filtros) {
      if (filtros.estado) {
        params = params.set('estado', filtros.estado);
      }
      if (filtros.proveedor_id) {
        params = params.set('proveedor_id', filtros.proveedor_id.toString());
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

    return this.http.get<ApiResponse<PaginatedResponse<Pedido>>>(this.apiUrl, { params });
  }

  // Obtener pedido por ID
  obtenerPedido(id: number): Observable<ApiResponse<Pedido>> {
    return this.http.get<ApiResponse<Pedido>>(`${this.apiUrl}/${id}`);
  }

  // Crear nuevo pedido
  crearPedido(pedido: PedidoCreate): Observable<ApiResponse<Pedido>> {
    return this.http.post<ApiResponse<Pedido>>(this.apiUrl, pedido);
  }

  // Actualizar estado del pedido
  actualizarEstadoPedido(id: number, estado: PedidoUpdate): Observable<ApiResponse<Pedido>> {
    return this.http.put<ApiResponse<Pedido>>(`${this.apiUrl}/${id}/estado`, estado);
  }

  // Obtener estadísticas de pedidos
  obtenerEstadisticasPedidos(): Observable<ApiResponse<PedidoEstadisticas>> {
    return this.http.get<ApiResponse<PedidoEstadisticas>>(`${this.apiUrl}/estadisticas`);
  }
}
