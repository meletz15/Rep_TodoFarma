import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PreviewResponse {
  ok: boolean;
  mensaje: string;
  datos: {
    totalFilas: number;
    filasValidas: number;
    filasConError: number;
    preview: any[];
    todosLosDatos?: any[]; // Todos los datos válidos para confirmar
    errores: Array<{
      fila: number;
      datos: any;
      error: string;
    }>;
  };
}

export interface ConfirmarCargaResponse {
  ok: boolean;
  mensaje: string;
  datos: {
    creados: number;
    actualizados: number;
    errores: Array<{
      indice: number;
      datos: any;
      error: string;
    }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CargaService {
  private apiUrl = `${environment.apiUrl}/carga`;

  constructor(private http: HttpClient) {}

  descargarPlantilla(tipo: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/plantilla/${tipo}`, {
      responseType: 'blob'
    });
  }

  procesarArchivo(archivo: File, tipo: string): Observable<PreviewResponse> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('tipo', tipo);

    return this.http.post<PreviewResponse>(`${this.apiUrl}/procesar`, formData);
  }

  confirmarCarga(tipo: string, datos: any[]): Observable<ConfirmarCargaResponse> {
    return this.http.post<ConfirmarCargaResponse>(`${this.apiUrl}/confirmar`, {
      tipo,
      datos
    });
  }
}

