import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  UnidadMedida, 
  UnidadMedidaCreate, 
  UnidadMedidaUpdate
} from '../models/unidad-medida.model';

export interface UnidadMedidaFiltros {
  activo?: string;
  busqueda?: string;
}

export interface UnidadMedidaResponse {
  ok: boolean;
  mensaje: string;
  datos: UnidadMedida;
}

export interface UnidadesMedidaResponse {
  ok: boolean;
  mensaje: string;
  datos: {
    datos?: UnidadMedida[];
    items?: UnidadMedida[];
    paginacion?: {
      pagina: number;
      limite: number;
      total: number;
      totalPaginas: number;
      tieneSiguiente?: boolean;
      tieneAnterior?: boolean;
    };
    total?: number;
    pagina?: number;
    limite?: number;
    totalPaginas?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {
  private apiUrl = `${environment.apiUrl}/unidad-medida`;

  constructor(private http: HttpClient) {}

  obtenerTodas(
    pagina: number = 1,
    limite: number = 10,
    filtros?: UnidadMedidaFiltros
  ): Observable<UnidadesMedidaResponse> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (filtros?.activo) {
      params = params.set('activo', filtros.activo);
    }

    if (filtros?.busqueda) {
      params = params.set('busqueda', filtros.busqueda);
    }

    return this.http.get<UnidadesMedidaResponse>(this.apiUrl, { params });
  }

  obtenerActivas(): Observable<{ ok: boolean; mensaje: string; datos: UnidadMedida[] }> {
    return this.http.get<{ ok: boolean; mensaje: string; datos: UnidadMedida[] }>(
      `${this.apiUrl}/activas`
    );
  }

  obtenerPorId(id: number): Observable<UnidadMedidaResponse> {
    return this.http.get<UnidadMedidaResponse>(`${this.apiUrl}/${id}`);
  }

  crear(unidadMedida: UnidadMedidaCreate): Observable<UnidadMedidaResponse> {
    return this.http.post<UnidadMedidaResponse>(this.apiUrl, unidadMedida);
  }

  actualizar(id: number, unidadMedida: UnidadMedidaUpdate): Observable<UnidadMedidaResponse> {
    return this.http.put<UnidadMedidaResponse>(`${this.apiUrl}/${id}`, unidadMedida);
  }

  eliminar(id: number): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}`);
  }
}

