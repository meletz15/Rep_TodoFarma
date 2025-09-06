import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente, ClienteCreate, ClienteUpdate, ClienteEstadisticas, ApiResponse, PaginatedResponse } from '../models/cliente.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(private http: HttpClient) { }

  // Obtener todos los clientes con paginación y filtros
  obtenerClientes(pagina: number = 1, limite: number = 10, filtros?: any): Observable<ApiResponse<PaginatedResponse<Cliente>>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (filtros) {
      if (filtros.activo !== undefined && filtros.activo !== '') params = params.set('activo', filtros.activo);
      if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    }

    return this.http.get<ApiResponse<PaginatedResponse<Cliente>>>(`${environment.apiUrl}/clientes`, { params });
  }

  // Obtener cliente por ID
  obtenerCliente(id: number): Observable<ApiResponse<Cliente>> {
    return this.http.get<ApiResponse<Cliente>>(`${environment.apiUrl}/clientes/${id}`);
  }

  // Crear nuevo cliente
  crearCliente(cliente: ClienteCreate): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(`${environment.apiUrl}/clientes`, cliente);
  }

  // Actualizar cliente
  actualizarCliente(id: number, cliente: ClienteUpdate): Observable<ApiResponse<Cliente>> {
    return this.http.put<ApiResponse<Cliente>>(`${environment.apiUrl}/clientes/${id}`, cliente);
  }

  // Eliminar cliente
  eliminarCliente(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${environment.apiUrl}/clientes/${id}`);
  }

  // Obtener estadísticas de clientes
  obtenerEstadisticas(): Observable<ApiResponse<ClienteEstadisticas>> {
    return this.http.get<ApiResponse<ClienteEstadisticas>>(`${environment.apiUrl}/clientes/estadisticas`);
  }

  // Obtener clientes por rango de fechas
  obtenerPorRangoFechas(desde: string, hasta: string): Observable<ApiResponse<Cliente[]>> {
    let params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);

    return this.http.get<ApiResponse<Cliente[]>>(`${environment.apiUrl}/clientes/rango-fechas`, { params });
  }
}
