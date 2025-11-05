import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FormatoSistema {
  formatoFecha: string;
  formatoHora: string;
  formatoMoneda: string;
  separadorDecimal: string;
  separadorMiles: string;
  idioma: string;
  zonaHoraria: string;
}

export interface DatosFacturacion {
  nit: string;
  nombreEmpresa: string;
  mensajeFactura: string;
  mensajePie: string;
}

export interface DireccionEmpresa {
  direccion: string;
  ciudad: string;
  departamento: string;
  codigoPostal: string;
  pais: string;
}

export interface TelefonosEmpresa {
  telefonoPrincipal: string;
  telefonoSecundario: string;
  fax: string;
  whatsapp: string;
  email: string;
  sitioWeb: string;
}

export interface ConfiguracionCompleta {
  idConfiguracion: number;
  formatoSistema: FormatoSistema;
  datosFacturacion: DatosFacturacion;
  direccionEmpresa: DireccionEmpresa;
  telefonosEmpresa: TelefonosEmpresa;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  mensaje: string;
  datos: T;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private apiUrl = `${environment.apiUrl}/configuracion`;

  constructor(private http: HttpClient) {}

  // Obtener configuración completa del sistema
  obtenerConfiguracion(): Observable<ApiResponse<ConfiguracionCompleta>> {
    return this.http.get<ApiResponse<ConfiguracionCompleta>>(this.apiUrl);
  }

  // Actualizar formato del sistema
  actualizarFormato(formatoSistema: FormatoSistema): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/formato`, formatoSistema);
  }

  // Actualizar datos de facturación
  actualizarFacturacion(datosFacturacion: DatosFacturacion): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/facturacion`, datosFacturacion);
  }

  // Actualizar dirección de la empresa
  actualizarDireccion(direccionEmpresa: DireccionEmpresa): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/direccion`, direccionEmpresa);
  }

  // Actualizar teléfonos de la empresa
  actualizarTelefonos(telefonosEmpresa: TelefonosEmpresa): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/telefonos`, telefonosEmpresa);
  }
}
