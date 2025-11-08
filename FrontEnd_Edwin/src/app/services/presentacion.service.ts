import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Presentacion, 
  PresentacionCreate, 
  PresentacionUpdate
} from '../models/presentacion.model';

export interface PresentacionFiltros {
  activo?: string;
  busqueda?: string;
}

export interface PresentacionResponse {
  ok: boolean;
  mensaje: string;
  datos: Presentacion;
}

export interface PresentacionesResponse {
  ok: boolean;
  mensaje: string;
  datos: {
    datos?: Presentacion[];  // Backend devuelve datos.datos
    items?: Presentacion[];  // Alternativa
    paginacion?: {
      pagina: number;
      limite: number;
      total: number;
      totalPaginas: number;
      tieneSiguiente?: boolean;
      tieneAnterior?: boolean;
    };
    total?: number;  // Alternativa sin paginación
    pagina?: number;
    limite?: number;
    totalPaginas?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PresentacionService {
  private apiUrl = `${environment.apiUrl}/presentacion`;

  constructor(private http: HttpClient) {}

  obtenerTodas(
    pagina: number = 1,
    limite: number = 10,
    filtros?: PresentacionFiltros
  ): Observable<PresentacionesResponse> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (filtros?.activo) {
      params = params.set('activo', filtros.activo);
    }

    if (filtros?.busqueda) {
      params = params.set('busqueda', filtros.busqueda);
    }

    return this.http.get<PresentacionesResponse>(this.apiUrl, { params });
  }

  obtenerActivas(): Observable<{ ok: boolean; mensaje: string; datos: Presentacion[] }> {
    return this.http.get<{ ok: boolean; mensaje: string; datos: Presentacion[] }>(
      `${this.apiUrl}/activas`
    );
  }

  obtenerPorId(id: number): Observable<PresentacionResponse> {
    return this.http.get<PresentacionResponse>(`${this.apiUrl}/${id}`);
  }

  crear(presentacion: PresentacionCreate): Observable<PresentacionResponse> {
    return this.http.post<PresentacionResponse>(this.apiUrl, presentacion);
  }

  actualizar(id: number, presentacion: PresentacionUpdate): Observable<PresentacionResponse> {
    return this.http.put<PresentacionResponse>(`${this.apiUrl}/${id}`, presentacion);
  }

  eliminar(id: number): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}`);
  }
}

