import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioService } from '../../services/usuario.service';
import { ProductoService } from '../../services/producto.service';
import { VentaService } from '../../services/venta.service';
import { InventarioService } from '../../services/inventario.service';
import { ProductoStockBajo } from '../../models/inventario.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Datos del dashboard
  usuariosActivos = 0;
  totalProductos = 0;
  ventasHoy = 0;
  ingresosHoy = 0;

  // Productos con stock bajo
  productosStockBajo: ProductoStockBajo[] = [];
  cargandoStockBajo = false;

  // Estados de carga
  cargando = true;
  cargandoUsuarios = false;
  cargandoProductos = false;
  cargandoVentas = false;

  constructor(
    private usuarioService: UsuarioService,
    private productoService: ProductoService,
    private ventaService: VentaService,
    private inventarioService: InventarioService
  ) {}

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard(): void {
    this.cargando = true;
    
    // Cargar usuarios activos
    this.cargarUsuariosActivos();
    
    // Cargar productos
    this.cargarProductos();
    
    // Cargar estadísticas de ventas
    this.cargarEstadisticasVentas();
    
    // Cargar productos con stock bajo
    this.cargarProductosStockBajo();
  }

  cargarUsuariosActivos(): void {
    this.cargandoUsuarios = true;
    this.usuarioService.obtenerUsuarios(1, 1, { estado: 'ACTIVO' })
      .subscribe({
        next: (response) => {
          if (response.ok && response.datos) {
            this.usuariosActivos = response.datos.paginacion?.total || 0;
          }
          this.cargandoUsuarios = false;
          this.verificarCargaCompleta();
        },
        error: (error) => {
          console.error('Error al cargar usuarios activos:', error);
          this.usuariosActivos = 0;
          this.cargandoUsuarios = false;
          this.verificarCargaCompleta();
        }
      });
  }

  cargarProductos(): void {
    this.cargandoProductos = true;
    this.productoService.obtenerEstadisticasProductos()
      .subscribe({
        next: (response) => {
          if (response.ok && response.datos) {
            this.totalProductos = response.datos.productos_activos || response.datos.total_productos || 0;
          }
          this.cargandoProductos = false;
          this.verificarCargaCompleta();
        },
        error: (error) => {
          console.error('Error al cargar productos:', error);
          // Fallback: intentar obtener productos con paginación
          this.productoService.obtenerProductos(1, 1, { activo: 'true' })
            .subscribe({
              next: (response) => {
                if (response.ok && response.datos) {
                  this.totalProductos = response.datos.paginacion?.total || 0;
                }
                this.cargandoProductos = false;
                this.verificarCargaCompleta();
              },
              error: () => {
                this.totalProductos = 0;
                this.cargandoProductos = false;
                this.verificarCargaCompleta();
              }
            });
        }
      });
  }

  cargarEstadisticasVentas(): void {
    this.cargandoVentas = true;
    this.ventaService.obtenerEstadisticasVentas()
      .subscribe({
        next: (response) => {
          if (response.ok && response.datos) {
            this.ventasHoy = response.datos.ventas_hoy || 0;
            this.ingresosHoy = response.datos.ventas_hoy_monto || 0;
          }
          this.cargandoVentas = false;
          this.verificarCargaCompleta();
        },
        error: (error) => {
          console.error('Error al cargar estadísticas de ventas:', error);
          this.ventasHoy = 0;
          this.ingresosHoy = 0;
          this.cargandoVentas = false;
          this.verificarCargaCompleta();
        }
      });
  }

  verificarCargaCompleta(): void {
    if (!this.cargandoUsuarios && !this.cargandoProductos && !this.cargandoVentas) {
      this.cargando = false;
    }
  }

  formatearNumero(numero: number): string {
    return numero.toLocaleString('es-GT');
  }

  formatearPrecio(precio: number): string {
    return `Q${precio.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  cargarProductosStockBajo(): void {
    this.cargandoStockBajo = true;
    this.inventarioService.obtenerProductosStockBajo(10)
      .subscribe({
        next: (response) => {
          if (response.ok && response.datos) {
            this.productosStockBajo = response.datos;
          } else {
            this.productosStockBajo = [];
          }
          this.cargandoStockBajo = false;
        },
        error: (error) => {
          console.error('Error al cargar productos con stock bajo:', error);
          this.productosStockBajo = [];
          this.cargandoStockBajo = false;
        }
      });
  }
}
