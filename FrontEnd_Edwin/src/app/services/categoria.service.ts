import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Categoria, 
  CategoriaCreate, 
  CategoriaUpdate, 
  CategoriaEstadisticas,
  ApiResponse, 
  PaginatedResponse 
} from '../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  // Obtener categorías con paginación y filtros
  obtenerCategorias(pagina: number = 1, limite: number = 10, filtros?: any): Observable<ApiResponse<PaginatedResponse<Categoria>>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (filtros) {
      if (filtros.activo !== undefined && filtros.activo !== '') {
        params = params.set('activo', filtros.activo);
      }
      if (filtros.busqueda) {
        params = params.set('busqueda', filtros.busqueda);
      }
    }

    return this.http.get<ApiResponse<PaginatedResponse<Categoria>>>(this.apiUrl, { params });
  }

  // Obtener categorías activas (para dropdowns)
  obtenerCategoriasActivas(): Observable<ApiResponse<Categoria[]>> {
    return this.http.get<ApiResponse<Categoria[]>>(`${this.apiUrl}/activas`);
  }

  // Obtener categoría por ID
  obtenerCategoria(id: number): Observable<ApiResponse<Categoria>> {
    return this.http.get<ApiResponse<Categoria>>(`${this.apiUrl}/${id}`);
  }

  // Crear nueva categoría
  crearCategoria(categoria: CategoriaCreate): Observable<ApiResponse<Categoria>> {
    return this.http.post<ApiResponse<Categoria>>(this.apiUrl, categoria);
  }

  // Actualizar categoría
  actualizarCategoria(id: number, categoria: CategoriaUpdate): Observable<ApiResponse<Categoria>> {
    return this.http.put<ApiResponse<Categoria>>(`${this.apiUrl}/${id}`, categoria);
  }

  // Eliminar categoría
  eliminarCategoria(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  // Obtener estadísticas de categorías
  obtenerEstadisticasCategorias(): Observable<ApiResponse<CategoriaEstadisticas>> {
    return this.http.get<ApiResponse<CategoriaEstadisticas>>(`${this.apiUrl}/estadisticas`);
  }
}
