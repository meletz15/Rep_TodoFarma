import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FiltrosReporte {
  desde?: string;
  hasta?: string;
  fecha?: string;
  estado?: string;
  usuario_id?: number;
  cliente_id?: number;
  proveedor_id?: number;
  categoria_id?: number;
  marca_id?: number;
  tipo?: string;
  producto_id?: number;
  limite?: number;
  dias?: number;
  stock_bajo?: boolean;
  activo?: boolean;
}

export interface RespuestaReporte {
  ok: boolean;
  mensaje: string;
  datos: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  // ========================================
  // REPORTES DE USUARIOS
  // ========================================

  obtenerUsuariosActivos(pagina: number = 1, limite: number = 10): Observable<RespuestaReporte> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/usuarios/activos`, { params });
  }

  obtenerUsuariosInactivos(pagina: number = 1, limite: number = 10): Observable<RespuestaReporte> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/usuarios/inactivos`, { params });
  }

  obtenerUsuariosPorFecha(desde: string, hasta: string): Observable<RespuestaReporte> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/usuarios/por-fecha`, { params });
  }

  // ========================================
  // REPORTES DE VENTAS
  // ========================================

  obtenerVentasPorPeriodo(filtros: FiltrosReporte): Observable<RespuestaReporte> {
    let params = new HttpParams();
    
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.usuario_id) params = params.set('usuario_id', filtros.usuario_id.toString());
    if (filtros.cliente_id) params = params.set('cliente_id', filtros.cliente_id.toString());
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/ventas/por-periodo`, { params });
  }

  obtenerVentasPorUsuario(desde: string, hasta: string): Observable<RespuestaReporte> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/ventas/por-usuario`, { params });
  }

  obtenerVentasPorCliente(desde: string, hasta: string, limite: number = 10): Observable<RespuestaReporte> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta)
      .set('limite', limite.toString());
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/ventas/por-cliente`, { params });
  }

  obtenerProductosMasVendidos(desde: string, hasta: string, limite: number = 10): Observable<RespuestaReporte> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta)
      .set('limite', limite.toString());
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/ventas/productos-mas-vendidos`, { params });
  }

  // ========================================
  // REPORTES DE INVENTARIO
  // ========================================

  obtenerMovimientosInventario(filtros: FiltrosReporte): Observable<RespuestaReporte> {
    let params = new HttpParams();
    
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros.producto_id) params = params.set('producto_id', filtros.producto_id.toString());
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/inventario/movimientos`, { params });
  }

  obtenerStockActual(filtros: FiltrosReporte): Observable<RespuestaReporte> {
    let params = new HttpParams();
    
    if (filtros.categoria_id) params = params.set('categoria_id', filtros.categoria_id.toString());
    if (filtros.marca_id) params = params.set('marca_id', filtros.marca_id.toString());
    if (filtros.stock_bajo !== undefined) params = params.set('stock_bajo', filtros.stock_bajo.toString());
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/inventario/stock-actual`, { params });
  }

  obtenerProductosProximosAVencer(dias: number = 30): Observable<RespuestaReporte> {
    const params = new HttpParams().set('dias', dias.toString());
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/inventario/productos-proximos-vencer`, { params });
  }

  // ========================================
  // REPORTES DE CAJA
  // ========================================

  obtenerResumenDiarioCaja(fecha: string): Observable<RespuestaReporte> {
    const params = new HttpParams().set('fecha', fecha);
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/caja/resumen-diario`, { params });
  }

  obtenerHistoricoCajas(filtros: FiltrosReporte): Observable<RespuestaReporte> {
    let params = new HttpParams();
    
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/caja/historico`, { params });
  }

  // ========================================
  // REPORTES DE PEDIDOS
  // ========================================

  obtenerPedidosPorEstado(filtros: FiltrosReporte): Observable<RespuestaReporte> {
    let params = new HttpParams();
    
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.proveedor_id) params = params.set('proveedor_id', filtros.proveedor_id.toString());
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/pedidos/por-estado`, { params });
  }

  obtenerAnalisisProveedores(desde: string, hasta: string): Observable<RespuestaReporte> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/pedidos/analisis-proveedores`, { params });
  }

  // ========================================
  // REPORTES DE PRODUCTOS
  // ========================================

  obtenerProductosPorCategoria(activo: boolean = true): Observable<RespuestaReporte> {
    const params = new HttpParams().set('activo', activo.toString());
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/productos/por-categoria`, { params });
  }

  obtenerProductosPorMarca(activo: boolean = true): Observable<RespuestaReporte> {
    const params = new HttpParams().set('activo', activo.toString());
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/productos/por-marca`, { params });
  }

  // ========================================
  // REPORTES DE CLIENTES
  // ========================================

  obtenerClientesMasFrecuentes(desde: string, hasta: string, limite: number = 10): Observable<RespuestaReporte> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta)
      .set('limite', limite.toString());
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/clientes/mas-frecuentes`, { params });
  }

  obtenerClientesPorValorCompras(desde: string, hasta: string, limite: number = 10): Observable<RespuestaReporte> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta)
      .set('limite', limite.toString());
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/clientes/por-valor-compras`, { params });
  }

  // ========================================
  // REPORTES FINANCIEROS
  // ========================================

  obtenerIngresosPorPeriodo(desde: string, hasta: string): Observable<RespuestaReporte> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/financieros/ingresos-por-periodo`, { params });
  }

  obtenerGastosPorCompras(desde: string, hasta: string): Observable<RespuestaReporte> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/financieros/gastos-por-compras`, { params });
  }

  // ========================================
  // REPORTES DE PROVEEDORES
  // ========================================

  obtenerProveedoresPorEstado(estado?: string): Observable<RespuestaReporte> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/proveedores/por-estado`, { params });
  }

  // ========================================
  // DASHBOARD EJECUTIVO
  // ========================================

  obtenerEstadisticas(): Observable<RespuestaReporte> {
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/estadisticas`);
  }

  obtenerDashboardEjecutivo(desde: string, hasta: string): Observable<RespuestaReporte> {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta);
    
    return this.http.get<RespuestaReporte>(`${this.apiUrl}/dashboard-ejecutivo`, { params });
  }
}
