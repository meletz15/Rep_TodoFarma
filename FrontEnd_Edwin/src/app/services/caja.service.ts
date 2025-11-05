import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Caja, 
  CajaCreate, 
  CajaCerrar, 
  CajaEstadisticasGenerales,
  ResumenDia,
  CajaFiltros,
  ApiResponse, 
  PaginatedResponse 
} from '../models/caja.model';

@Injectable({
  providedIn: 'root'
})
export class CajaService {
  private apiUrl = `${environment.apiUrl}/caja`;

  constructor(private http: HttpClient) {}

  // Abrir caja
  abrirCaja(caja: CajaCreate): Observable<ApiResponse<Caja>> {
    return this.http.post<ApiResponse<Caja>>(`${this.apiUrl}/abrir`, caja);
  }

  // Cerrar caja
  cerrarCaja(idCaja: number, datosCierre: CajaCerrar): Observable<ApiResponse<Caja>> {
    return this.http.put<ApiResponse<Caja>>(`${this.apiUrl}/${idCaja}/cerrar`, datosCierre);
  }

  // Obtener caja abierta
  obtenerCajaAbierta(): Observable<ApiResponse<Caja | null>> {
    return this.http.get<ApiResponse<Caja | null>>(`${this.apiUrl}/abierta`);
  }

  // Obtener todas las cajas con paginación y filtros (para compatibilidad con otros componentes)
  obtenerCajas(pagina: number = 1, limite: number = 10, filtros?: CajaFiltros): Observable<ApiResponse<PaginatedResponse<Caja>>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (filtros) {
      if (filtros.estado) {
        params = params.set('estado', filtros.estado);
      }
      if (filtros.usuario_apertura) {
        params = params.set('usuario_apertura', filtros.usuario_apertura.toString());
      }
      // NO enviar fechas al backend - se filtran en el frontend
      // if (filtros.fecha_desde) {
      //   params = params.set('fecha_desde', filtros.fecha_desde);
      // }
      // if (filtros.fecha_hasta) {
      //   params = params.set('fecha_hasta', filtros.fecha_hasta);
      // }
    }

    return this.http.get<ApiResponse<PaginatedResponse<Caja>>>(this.apiUrl, { params });
  }

  // Obtener todas las cajas sin paginación (para filtrado y paginación en frontend)
  obtenerTodasLasCajas(filtros?: CajaFiltros): Observable<ApiResponse<PaginatedResponse<Caja>>> {
    let params = new HttpParams();
    
    // El backend tiene un límite máximo de 100 según validarPaginacion
    // Usamos el límite máximo permitido para obtener la mayor cantidad de cajas
    params = params.set('pagina', '1').set('limite', '100');

    if (filtros) {
      if (filtros.estado) {
        params = params.set('estado', filtros.estado);
      }
      if (filtros.usuario_apertura) {
        params = params.set('usuario_apertura', filtros.usuario_apertura.toString());
      }
      // NO enviar fechas al backend - se filtran en el frontend
    }

    return this.http.get<ApiResponse<PaginatedResponse<Caja>>>(this.apiUrl, { params });
  }

  // Obtener caja por ID
  obtenerCaja(id: number): Observable<ApiResponse<Caja>> {
    return this.http.get<ApiResponse<Caja>>(`${this.apiUrl}/${id}`);
  }

  // Verificar si hay caja abierta
  verificarCajaAbierta(): Observable<ApiResponse<{ hay_caja_abierta: boolean }>> {
    return this.http.get<ApiResponse<{ hay_caja_abierta: boolean }>>(`${this.apiUrl}/verificar`);
  }

  // Obtener resumen de caja por día
  obtenerResumenPorDia(fecha: string): Observable<ApiResponse<ResumenDia[]>> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<ApiResponse<ResumenDia[]>>(`${this.apiUrl}/resumen-dia`, { params });
  }

  // Obtener estadísticas de caja
  obtenerEstadisticasCaja(): Observable<ApiResponse<CajaEstadisticasGenerales>> {
    return this.http.get<ApiResponse<CajaEstadisticasGenerales>>(`${this.apiUrl}/estadisticas`);
  }
}
