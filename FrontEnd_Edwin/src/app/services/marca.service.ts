import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Marca {
  id_marca: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarcaFiltros {
  activo?: string;
  busqueda?: string;
}

export interface MarcaResponse {
  exito: boolean;
  mensaje: string;
  datos: {
    datos: Marca[];
    paginacion: {
      pagina: number;
      limite: number;
      total: number;
      totalPaginas: number;
      tieneSiguiente: boolean;
      tieneAnterior: boolean;
    };
  };
}

export interface MarcaActiva {
  id_marca: number;
  nombre: string;
}

export interface MarcaActivaResponse {
  exito: boolean;
  mensaje: string;
  datos: MarcaActiva[];
}

@Injectable({
  providedIn: 'root'
})
export class MarcaService {
  private apiUrl = `${environment.apiUrl}/marcas`;

  constructor(private http: HttpClient) { }

  // Obtener todas las marcas con paginación y filtros
  obtenerMarcas(pagina: number = 1, limite: number = 10, filtros: MarcaFiltros = {}): Observable<MarcaResponse> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (filtros.activo !== undefined && filtros.activo !== '') {
      params = params.set('activo', filtros.activo);
    }
    if (filtros.busqueda && filtros.busqueda.trim() !== '') {
      params = params.set('busqueda', filtros.busqueda.trim());
    }

    return this.http.get<MarcaResponse>(this.apiUrl, { params });
  }

  // Obtener marca por ID
  obtenerMarcaPorId(id: number): Observable<{ exito: boolean; mensaje: string; datos: Marca }> {
    return this.http.get<{ exito: boolean; mensaje: string; datos: Marca }>(`${this.apiUrl}/${id}`);
  }

  // Crear nueva marca
  crearMarca(marca: Partial<Marca>): Observable<{ exito: boolean; mensaje: string; datos: Marca }> {
    return this.http.post<{ exito: boolean; mensaje: string; datos: Marca }>(this.apiUrl, marca);
  }

  // Actualizar marca
  actualizarMarca(id: number, marca: Partial<Marca>): Observable<{ exito: boolean; mensaje: string; datos: Marca }> {
    return this.http.put<{ exito: boolean; mensaje: string; datos: Marca }>(`${this.apiUrl}/${id}`, marca);
  }

  // Eliminar marca (soft delete)
  eliminarMarca(id: number): Observable<{ exito: boolean; mensaje: string }> {
    return this.http.delete<{ exito: boolean; mensaje: string }>(`${this.apiUrl}/${id}`);
  }

  // Obtener marcas activas para dropdown
  obtenerMarcasActivas(): Observable<MarcaActivaResponse> {
    return this.http.get<MarcaActivaResponse>(`${this.apiUrl}/activas`);
  }
}
