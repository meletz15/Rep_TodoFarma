import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Rol, RolCreate, RolUpdate } from '../models/rol.model';

export interface RolesResponse {
  ok: boolean;
  mensaje: string;
  datos: Rol[];
}

export interface RolResponse {
  ok: boolean;
  mensaje: string;
  datos: Rol;
}

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  obtenerTodos(activos?: boolean): Observable<RolesResponse> {
    let params = new HttpParams();
    if (activos !== undefined) {
      params = params.set('activos', activos.toString());
    }
    return this.http.get<RolesResponse>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<RolResponse> {
    return this.http.get<RolResponse>(`${this.apiUrl}/${id}`);
  }

  crear(rol: RolCreate): Observable<RolResponse> {
    return this.http.post<RolResponse>(this.apiUrl, rol);
  }

  actualizar(id: number, rol: RolUpdate): Observable<RolResponse> {
    return this.http.put<RolResponse>(`${this.apiUrl}/${id}`, rol);
  }

  eliminar(id: number): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.delete<{ ok: boolean; mensaje: string }>(`${this.apiUrl}/${id}`);
  }
}

