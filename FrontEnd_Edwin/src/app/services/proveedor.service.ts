import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proveedor, ProveedorCreate, ProveedorUpdate, ApiResponse, PaginatedResponse } from '../models/proveedor.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ProveedorService {
  constructor(private http: HttpClient) { }

  // Obtener todos los proveedores con paginación y filtros
    obtenerProveedores(pagina: number = 1, limite: number = 10, filtros?: any): Observable<ApiResponse<PaginatedResponse<Proveedor>>> {
      let params = new HttpParams()
        .set('pagina', pagina.toString())
        .set('limite', limite.toString());
  
      if (filtros) {
        if (filtros.empresa) params = params.set('empresa', filtros.empresa);
        if (filtros.estado) params = params.set('estado', filtros.estado);
        if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
      }
  
      return this.http.get<ApiResponse<PaginatedResponse<Proveedor>>>(`${environment.apiUrl}/proveedores`, { params });
    }

    // Obtener proveedor por ID
    obtenerProveedor(id: number): Observable<ApiResponse<Proveedor>> {
      return this.http.get<ApiResponse<Proveedor>>(`${environment.apiUrl}/proveedores/${id}`);
    }

    // Crear nuevo proveedor
    crearProveedor(proveedor: ProveedorCreate): Observable<ApiResponse<Proveedor>> {
      return this.http.post<ApiResponse<Proveedor>>(`${environment.apiUrl}/proveedores`, proveedor);
    }

    // Actualizar proveedor
    actualizarProveedor(id: number, proveedor: ProveedorUpdate): Observable<ApiResponse<Proveedor>> {
      return this.http.put<ApiResponse<Proveedor>>(`${environment.apiUrl}/proveedores/${id}`, proveedor);
    }

    // Eliminar proveedor
    eliminarProveedor(id: number): Observable<ApiResponse<any>> {
      return this.http.delete<ApiResponse<any>>(`${environment.apiUrl}/proveedores/${id}`);
    }
}