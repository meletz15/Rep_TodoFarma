import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';

import { InventarioService } from '../../services/inventario.service';
import { ProductoService } from '../../services/producto.service';
import { UsuarioService } from '../../services/usuario.service';
import { CategoriaService } from '../../services/categoria.service';
import { 
  InventarioMovimiento, 
  KardexProducto,
  MovimientoCreate,
  InventarioEstadisticas,
  ProductoStockBajo,
  ProductoPorVencer,
  ResumenCategoria,
  InventarioFiltros 
} from '../../models/inventario.model';
import { Producto } from '../../models/producto.model';
import { Usuario } from '../../models/usuario.model';
import { ConfirmDialogComponent } from '../../components/confirm-dialog.component';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatStepperModule
  ],
  templateUrl: './inventario.component.html'
})
export class InventarioComponent implements OnInit {
  @ViewChild('movimientoPaginator') movimientoPaginator!: MatPaginator;
  @ViewChild('movimientoSort') movimientoSort!: MatSort;
  @ViewChild('inventarioTotalPaginator') inventarioTotalPaginator!: MatPaginator;
  @ViewChild('inventarioTotalSort') inventarioTotalSort!: MatSort;

  // Propiedades para tabs
  tabSeleccionado = 0; // 0 = Movimientos, 1 = Inventario Total

  // Variables para movimientos
  movimientos: InventarioMovimiento[] = [];
  todasLasMovimientos: InventarioMovimiento[] = []; // Todos los movimientos cargados
  movimientosFiltrados: InventarioMovimiento[] = []; // Movimientos después de filtrar
  movimientosDataSource = new MatTableDataSource<InventarioMovimiento>();
  movimientosDisplayedColumns = ['fecha', 'producto', 'tipo', 'cantidad', 'fecha_vencimiento', 'numero_lote', 'referencia', 'usuario', 'observacion'];
  movimientoForm!: FormGroup;
  movimientoModalAbierto = false;
  movimientoCargando = false;
  movimientoTotal = 0;
  movimientoPagina = 1;
  movimientoLimite = 10;
  movimientoFiltros: InventarioFiltros = {
    producto_id: undefined,
    tipo: '',
    fecha_desde: '',
    fecha_hasta: '',
    busqueda: ''
  };

  // Variables para inventario total
  inventarioTotal: any[] = [];
  todasLasInventarioTotal: any[] = []; // Todos los productos cargados
  inventarioTotalFiltrados: any[] = []; // Productos después de filtrar
  inventarioTotalDataSource = new MatTableDataSource<any>();
  inventarioTotalDisplayedColumns = ['producto', 'stock_actual', 'precio_compra', 'precio_venta', 'valor_total'];
  inventarioTotalCargando = false;
  inventarioTotalPagina = 1;
  inventarioTotalLimite = 10;
  inventarioTotalTotal = 0;
  inventarioTotalFiltros = {
    busqueda: '',
    id_categoria: '',
    stock_bajo: '' // '10', '20', '30', '40', '50' o '' para ninguno
  };

  // Variables para nuevo movimiento
  nuevoMovimientoModalAbierto = false;
  nuevoMovimientoForm!: FormGroup;
  nuevoMovimientoCargando = false;

  // Variables para modal de prueba

  // Variables para kardex
  kardex: KardexProducto[] = [];
  kardexDataSource = new MatTableDataSource<KardexProducto>();
  kardexDisplayedColumns = ['fecha', 'tipo', 'cantidad', 'signo', 'stock_anterior', 'stock_actual', 'usuario_nombre', 'observacion'];
  productoSeleccionado: Producto | null = null;
  kardexCargando = false;
  kardexTotal = 0;
  kardexPagina = 1;
  kardexLimite = 10;

  // Variables para alertas
  productosStockBajo: ProductoStockBajo[] = [];
  productosPorVencer: ProductoPorVencer[] = [];
  resumenCategorias: ResumenCategoria[] = [];

  // Variables para formularios
  productosParaDropdown: Producto[] = [];
  usuariosParaDropdown: Usuario[] = [];
  categoriasParaDropdown: any[] = [];

  // Variables para estadísticas
  estadisticas: InventarioEstadisticas | null = null;

  // Variables generales
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private productoService: ProductoService,
    private usuarioService: UsuarioService,
    private categoriaService: CategoriaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.inicializarFormularios();
  }

  cargarCategoriasActivas(): void {
    this.categoriaService.obtenerCategorias(1, 100, { activo: 'true' })
      .subscribe({
        next: (response) => {
          this.categoriasParaDropdown = response.datos.datos || [];
        },
        error: (error) => {
          console.error('Error al cargar categorías:', error);
        }
      });
  }

  ngOnInit(): void {
    this.cargarMovimientos();
    this.cargarInventarioTotal();
    this.cargarProductosActivos();
    this.cargarUsuariosActivos();
    this.cargarCategoriasActivas();
    this.cargarEstadisticas();
    this.cargarAlertas();
  }

  inicializarFormularios(): void {
    // Formulario de movimiento manual
    this.movimientoForm = this.fb.group({
      producto_id: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      referencia: ['', [Validators.maxLength(100)]],
      usuario_id: [''],
      observacion: ['', [Validators.maxLength(300)]]
    });

    // Formulario de nuevo movimiento
    this.nuevoMovimientoForm = this.fb.group({
      producto_id: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      referencia: ['', [Validators.maxLength(100)]],
      usuario_id: ['', [Validators.required]],
      observacion: ['', [Validators.maxLength(300)]]
    });
  }

  // Métodos para movimientos
  cargarMovimientos(): void {
    this.movimientoCargando = true;
    
    // Cargar todos los movimientos (sin filtros, con límite alto)
    this.inventarioService.obtenerMovimientos(1, 100, {})
      .subscribe({
        next: (response) => {
          const movimientos = response.datos.datos || [];
          
          this.todasLasMovimientos = movimientos;
          this.aplicarFiltrosFrontend();
          this.movimientoCargando = false;
        },
        error: (error) => {
          console.error('Error al cargar movimientos:', error);
          this.snackBar.open('Error al cargar movimientos', 'Cerrar', { duration: 3000 });
          this.movimientoCargando = false;
        }
      });
  }

  aplicarFiltrosFrontend(): void {
    let movimientosFiltrados = [...this.todasLasMovimientos];

    // Filtro por tipo
    if (this.movimientoFiltros.tipo && this.movimientoFiltros.tipo !== '') {
      movimientosFiltrados = movimientosFiltrados.filter(m => m.tipo === this.movimientoFiltros.tipo);
    }

    // Filtro por producto_id
    if (this.movimientoFiltros.producto_id) {
      movimientosFiltrados = movimientosFiltrados.filter(m => m.producto_id === this.movimientoFiltros.producto_id);
    }

    // Filtro por búsqueda (referencia, observación, producto_nombre)
    if (this.movimientoFiltros.busqueda && this.movimientoFiltros.busqueda.trim() !== '') {
      const busqueda = this.movimientoFiltros.busqueda.toLowerCase().trim();
      movimientosFiltrados = movimientosFiltrados.filter(m => 
        (m.referencia && m.referencia.toLowerCase().includes(busqueda)) ||
        (m.observacion && m.observacion.toLowerCase().includes(busqueda)) ||
        (m.producto_nombre && m.producto_nombre.toLowerCase().includes(busqueda)) ||
        (m.sku && m.sku.toLowerCase().includes(busqueda))
      );
    }

    // Filtro por fecha desde
    if (this.movimientoFiltros.fecha_desde) {
      const fechaDesdeValor: any = this.movimientoFiltros.fecha_desde;
      const fechaDesde = fechaDesdeValor instanceof Date 
        ? fechaDesdeValor 
        : new Date(fechaDesdeValor);
      fechaDesde.setHours(0, 0, 0, 0);
      movimientosFiltrados = movimientosFiltrados.filter(m => {
        const fechaMovimiento = new Date(m.fecha);
        fechaMovimiento.setHours(0, 0, 0, 0);
        return fechaMovimiento >= fechaDesde;
      });
    }

    // Filtro por fecha hasta
    if (this.movimientoFiltros.fecha_hasta) {
      const fechaHastaValor: any = this.movimientoFiltros.fecha_hasta;
      const fechaHasta = fechaHastaValor instanceof Date 
        ? fechaHastaValor 
        : new Date(fechaHastaValor);
      fechaHasta.setHours(23, 59, 59, 999);
      movimientosFiltrados = movimientosFiltrados.filter(m => {
        const fechaMovimiento = new Date(m.fecha);
        return fechaMovimiento <= fechaHasta;
      });
    }

    this.movimientosFiltrados = movimientosFiltrados;
    this.aplicarPaginacionFrontend();
  }

  aplicarPaginacionFrontend(): void {
    const total = this.movimientosFiltrados.length;
    const inicio = (this.movimientoPagina - 1) * this.movimientoLimite;
    const fin = inicio + this.movimientoLimite;
    this.movimientos = this.movimientosFiltrados.slice(inicio, fin);
    this.movimientosDataSource.data = this.movimientos;
    this.movimientoTotal = total;
  }

  // Método para cargar inventario total
  cargarInventarioTotal(): void {
    this.inventarioTotalCargando = true;
    
    // Cargar todos los productos activos (hasta 100) para filtrar en frontend
    this.productoService.obtenerProductos(1, 100, { activo: 'true' })
      .subscribe({
        next: (response) => {
          const inventarioTotal = response.datos.datos || [];
          
          this.todasLasInventarioTotal = inventarioTotal;
          this.aplicarFiltrosInventarioTotal();
          this.inventarioTotalCargando = false;
        },
        error: (error) => {
          console.error('Error al cargar inventario total:', error);
          this.inventarioTotalCargando = false;
        }
      });
  }

  // Aplicar filtros al inventario total
  aplicarFiltrosInventarioTotal(): void {
    let filtrados = [...this.todasLasInventarioTotal];

    // Filtro por búsqueda
    if (this.inventarioTotalFiltros.busqueda && this.inventarioTotalFiltros.busqueda.trim() !== '') {
      const busqueda = this.inventarioTotalFiltros.busqueda.toLowerCase().trim();
      filtrados = filtrados.filter(producto => 
        producto.nombre?.toLowerCase().includes(busqueda) ||
        producto.sku?.toLowerCase().includes(busqueda) ||
        producto.codigo_barras?.toLowerCase().includes(busqueda) ||
        producto.categoria_nombre?.toLowerCase().includes(busqueda) ||
        producto.marca_nombre?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por categoría
    if (this.inventarioTotalFiltros.id_categoria && this.inventarioTotalFiltros.id_categoria !== '') {
      const categoriaId = parseInt(this.inventarioTotalFiltros.id_categoria);
      filtrados = filtrados.filter(producto => 
        producto.id_categoria === categoriaId
      );
    }

    // Filtro por stock bajo
    if (this.inventarioTotalFiltros.stock_bajo && this.inventarioTotalFiltros.stock_bajo !== '') {
      const umbralStock = parseInt(this.inventarioTotalFiltros.stock_bajo);
      filtrados = filtrados.filter(producto => 
        (producto.stock || 0) <= umbralStock
      );
    }

    this.inventarioTotalFiltrados = filtrados;
    this.inventarioTotalTotal = filtrados.length;
    this.inventarioTotalPagina = 1;
    this.aplicarPaginacionInventarioTotal();
  }

  // Aplicar paginación al inventario total
  aplicarPaginacionInventarioTotal(): void {
    const inicio = (this.inventarioTotalPagina - 1) * this.inventarioTotalLimite;
    const fin = inicio + this.inventarioTotalLimite;
    this.inventarioTotal = this.inventarioTotalFiltrados.slice(inicio, fin);
    this.inventarioTotalDataSource.data = this.inventarioTotal;
  }

  // Limpiar filtros de inventario total
  limpiarFiltrosInventarioTotal(): void {
    this.inventarioTotalFiltros = {
      busqueda: '',
      id_categoria: '',
      stock_bajo: ''
    };
    this.aplicarFiltrosInventarioTotal();
  }

  // Verificar si un producto tiene stock bajo (usando el umbral configurado o 10 por defecto)
  tieneStockBajo(stock: number): boolean {
    const umbral = this.inventarioTotalFiltros.stock_bajo ? parseInt(this.inventarioTotalFiltros.stock_bajo) : 10;
    return (stock || 0) <= umbral;
  }

  cargarProductosActivos(): void {
    this.productoService.obtenerProductos(1, 100, { activo: 'true' })
      .subscribe({
        next: (response) => {
          this.productosParaDropdown = response.datos.datos;
        },
        error: (error) => {
          console.error('Error al cargar productos:', error);
        }
      });
  }

  cargarUsuariosActivos(): void {
    this.usuarioService.obtenerUsuarios(1, 100, { activo: 'true' })
      .subscribe({
        next: (response) => {
          this.usuariosParaDropdown = response.datos.datos;
        },
        error: (error) => {
          console.error('Error al cargar usuarios:', error);
        }
      });
  }

  cargarEstadisticas(): void {
    this.inventarioService.obtenerEstadisticasInventario()
      .subscribe({
        next: (response) => {
          this.estadisticas = response.datos;
        },
        error: (error) => {
          console.error('Error al cargar estadísticas:', error);
        }
      });
  }

  cargarAlertas(): void {
    // Cargar productos con stock bajo
    this.inventarioService.obtenerProductosStockBajo(10)
      .subscribe({
        next: (response) => {
          this.productosStockBajo = response.datos;
        },
        error: (error) => {
          console.error('Error al cargar productos con stock bajo:', error);
        }
      });

    // Cargar productos próximos a vencer
    this.inventarioService.obtenerProductosPorVencer(30)
      .subscribe({
        next: (response) => {
          this.productosPorVencer = response.datos;
        },
        error: (error) => {
          console.error('Error al cargar productos por vencer:', error);
        }
      });

    // Cargar resumen por categoría
    this.inventarioService.obtenerResumenPorCategoria()
      .subscribe({
        next: (response) => {
          this.resumenCategorias = response.datos;
        },
        error: (error) => {
          console.error('Error al cargar resumen por categoría:', error);
        }
      });
  }

  // Métodos para kardex
  cargarKardexProducto(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.kardexCargando = true;
    this.inventarioService.obtenerKardexProducto(producto.id_producto, this.kardexPagina, this.kardexLimite)
      .subscribe({
        next: (response) => {
          this.kardex = response.datos.datos;
          this.kardexDataSource.data = this.kardex;
          this.kardexTotal = response.datos.paginacion.total;
          this.kardexCargando = false;
        },
        error: (error) => {
          console.error('Error al cargar kardex:', error);
          this.snackBar.open('Error al cargar kardex del producto', 'Cerrar', { duration: 3000 });
          this.kardexCargando = false;
        }
      });
  }

  // Métodos para movimiento manual
  abrirModalMovimiento(): void {
    this.movimientoModalAbierto = true;
    this.movimientoForm.reset();
  }

  cerrarModalMovimiento(): void {
    this.movimientoModalAbierto = false;
    this.movimientoForm.reset();
  }

  guardarMovimiento(): void {
    if (this.movimientoForm.valid) {
      const datosMovimiento = this.movimientoForm.value;
      this.inventarioService.crearMovimiento(datosMovimiento)
        .subscribe({
          next: (response) => {
            this.snackBar.open('Movimiento creado correctamente', 'Cerrar', { duration: 3000 });
            this.cerrarModalMovimiento();
            // Recargar todos los movimientos desde el backend
            this.cargarMovimientos();
            this.cargarEstadisticas();
            this.cargarAlertas();
          },
          error: (error) => {
            console.error('Error al crear movimiento:', error);
            this.snackBar.open('Error al crear movimiento', 'Cerrar', { duration: 3000 });
          }
        });
    } else {
      this.marcarFormularioComoTocado(this.movimientoForm);
    }
  }

  // Métodos de filtros y paginación
  aplicarFiltrosMovimiento(): void {
    this.movimientoPagina = 1;
    this.aplicarFiltrosFrontend();
  }

  limpiarFiltrosMovimiento(): void {
    this.movimientoFiltros = {
      producto_id: undefined,
      tipo: '',
      fecha_desde: '',
      fecha_hasta: '',
      busqueda: ''
    };
    this.movimientoPagina = 1;
    this.aplicarFiltrosFrontend();
  }

  onMovimientoPageChange(event: PageEvent): void {
    this.movimientoPagina = event.pageIndex + 1;
    this.movimientoLimite = event.pageSize;
    this.aplicarPaginacionFrontend();
  }

  onKardexPageChange(event: PageEvent): void {
    this.kardexPagina = event.pageIndex + 1;
    this.kardexLimite = event.pageSize;
    if (this.productoSeleccionado) {
      this.cargarKardexProducto(this.productoSeleccionado);
    }
  }

  onInventarioTotalPageChange(event: PageEvent): void {
    this.inventarioTotalPagina = event.pageIndex + 1;
    this.inventarioTotalLimite = event.pageSize;
    this.cargarInventarioTotal();
  }

  // Métodos auxiliares


  formatearPrecio(precio: any): string {
    if (precio === null || precio === undefined || precio === '') {
      return 'Q 0.00';
    }
    
    const precioNumero = typeof precio === 'string' ? parseFloat(precio) : Number(precio);
    
    if (isNaN(precioNumero)) {
      return 'Q 0.00';
    }
    
    return `Q ${precioNumero.toFixed(2)}`;
  }

  calcularValorTotal(producto: any): number {
    const stock = producto.stock || 0;
    const precioUnitario = parseFloat(producto.precio_unitario) || 0;
    return stock * precioUnitario;
  }

  formatearValorTotal(producto: any): string {
    const valorTotal = this.calcularValorTotal(producto);
    return `Q ${valorTotal.toFixed(2)}`;
  }

  obtenerColorTipo(tipo: string): string {
    switch (tipo) {
      case 'ENTRADA_COMPRA': return 'primary';
      case 'SALIDA_VENTA': return 'accent';
      case 'AJUSTE_ENTRADA': return 'primary';
      case 'AJUSTE_SALIDA': return 'warn';
      case 'DEVOLUCION_COMPRA': return 'warn';
      case 'DEVOLUCION_CLIENTE': return 'primary';
      default: return 'primary';
    }
  }

  obtenerIconoTipo(tipo: string): string {
    switch (tipo) {
      case 'ENTRADA_COMPRA': return 'add_shopping_cart';
      case 'SALIDA_VENTA': return 'remove_shopping_cart';
      case 'AJUSTE_ENTRADA': return 'add';
      case 'AJUSTE_SALIDA': return 'remove';
      case 'DEVOLUCION_COMPRA': return 'keyboard_return';
      case 'DEVOLUCION_CLIENTE': return 'undo';
      default: return 'swap_horiz';
    }
  }

  obtenerTextoSigno(signo: number): string {
    return signo > 0 ? '+' : '-';
  }

  obtenerColorSigno(signo: number): string {
    return signo > 0 ? 'primary' : 'warn';
  }

  obtenerDiasParaVencer(fechaVencimiento: string): number {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  obtenerColorDiasVencimiento(dias: number): string {
    if (dias < 0) return 'warn'; // Vencido
    if (dias <= 7) return 'accent'; // Próximo a vencer
    return 'primary'; // Normal
  }

  // Métodos para formateo
  esFechaVencida(fecha: string): boolean {
    if (!fecha) return false;
    const fechaVencimiento = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaVencimiento.setHours(0, 0, 0, 0);
    return fechaVencimiento < hoy;
  }

  esFechaPorVencer(fecha: string): boolean {
    if (!fecha) return false;
    const fechaVencimiento = new Date(fecha);
    const hoy = new Date();
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);
    hoy.setHours(0, 0, 0, 0);
    fechaVencimiento.setHours(0, 0, 0, 0);
    en30Dias.setHours(0, 0, 0, 0);
    return fechaVencimiento >= hoy && fechaVencimiento <= en30Dias;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearTipoMovimiento(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'ENTRADA_COMPRA': 'Entrada Compra',
      'SALIDA_VENTA': 'Salida Venta',
      'AJUSTE_ENTRADA': 'Ajuste Entrada',
      'AJUSTE_SALIDA': 'Ajuste Salida',
      'DEVOLUCION_COMPRA': 'Devolución Compra',
      'DEVOLUCION_CLIENTE': 'Devolución Cliente'
    };
    return tipos[tipo] || tipo;
  }

  // Métodos para nuevo movimiento
  abrirModalNuevoMovimiento(): void {
    this.nuevoMovimientoModalAbierto = true;
    this.nuevoMovimientoForm.reset({
      tipo: 'AJUSTE_ENTRADA',
      usuario_id: this.usuariosParaDropdown[0]?.id_usuario || ''
    });
  }


  cerrarModalNuevoMovimiento(): void {
    this.nuevoMovimientoModalAbierto = false;
    this.nuevoMovimientoForm.reset();
  }

  crearMovimientoSimplificado(): void {
    // Obtener valores del formulario simplificado
    const productoSelect = document.querySelector('select') as HTMLSelectElement;
    const tipoSelect = document.querySelectorAll('select')[1] as HTMLSelectElement;
    const cantidadInput = document.querySelector('input[type="number"]') as HTMLInputElement;
    const observacionTextarea = document.querySelector('textarea') as HTMLTextAreaElement;
    
    if (!productoSelect || !tipoSelect || !cantidadInput) {
      this.snackBar.open('Error: No se encontraron los campos del formulario', 'Cerrar', { duration: 3000 });
      return;
    }
    
    // Determinar el signo basado en el tipo de movimiento
    const tipo = tipoSelect.value as 'AJUSTE_ENTRADA' | 'AJUSTE_SALIDA' | 'DEVOLUCION_COMPRA' | 'DEVOLUCION_CLIENTE';
    const signo = (tipo === 'AJUSTE_ENTRADA' || tipo === 'DEVOLUCION_CLIENTE') ? 1 : -1;

    const datosMovimiento: MovimientoCreate = {
      producto_id: parseInt(productoSelect.value),
      tipo: tipo,
      cantidad: parseInt(cantidadInput.value),
      referencia: '',
      usuario_id: this.usuariosParaDropdown[0]?.id_usuario || 1,
      observacion: observacionTextarea?.value || '',
      signo: signo
    };
    
    // Validaciones básicas
    if (!datosMovimiento.producto_id || datosMovimiento.producto_id === 0) {
      this.snackBar.open('Por favor, seleccione un producto', 'Cerrar', { duration: 3000 });
      return;
    }
    
    if (!datosMovimiento.tipo) {
      this.snackBar.open('Por favor, seleccione un tipo de movimiento', 'Cerrar', { duration: 3000 });
      return;
    }
    
    if (!datosMovimiento.cantidad || datosMovimiento.cantidad <= 0) {
      this.snackBar.open('Por favor, ingrese una cantidad válida', 'Cerrar', { duration: 3000 });
      return;
    }
    
    // Crear movimiento usando el servicio
    this.nuevoMovimientoCargando = true;
    
    this.inventarioService.crearMovimiento(datosMovimiento)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Movimiento creado correctamente', 'Cerrar', { duration: 3000 });
          this.cerrarModalNuevoMovimiento();
          // Resetear paginación a la primera página para ver el nuevo movimiento
          this.movimientoPagina = 1;
          // Recargar todos los movimientos desde el backend
          this.cargarMovimientos();
          this.cargarEstadisticas();
          this.cargarProductosActivos(); // Recargar productos para actualizar stock en dropdown
          this.cargarInventarioTotal(); // Recargar inventario total para actualizar stock
        },
        error: (error) => {
          console.error('Error al crear movimiento:', error);
          this.snackBar.open('Error al crear movimiento: ' + (error.error?.mensaje || error.message), 'Cerrar', { duration: 5000 });
        },
        complete: () => {
          this.nuevoMovimientoCargando = false;
        }
      });
  }

  crearMovimiento(): void {
    if (this.nuevoMovimientoForm.valid) {
      this.nuevoMovimientoCargando = true;
      const datosMovimiento: MovimientoCreate = this.nuevoMovimientoForm.value;

      this.inventarioService.crearMovimiento(datosMovimiento)
        .subscribe({
          next: (response) => {
            this.snackBar.open('Movimiento creado correctamente', 'Cerrar', { duration: 3000 });
            this.cerrarModalNuevoMovimiento();
            // Resetear paginación a la primera página para ver el nuevo movimiento
            this.movimientoPagina = 1;
            // Recargar todos los movimientos desde el backend
            this.cargarMovimientos();
            this.cargarEstadisticas();
            this.cargarProductosActivos(); // Recargar productos para actualizar stock en dropdown
            this.cargarInventarioTotal(); // Recargar inventario total para actualizar stock
          },
          error: (error) => {
            console.error('Error al crear movimiento:', error);
            this.snackBar.open('Error al crear movimiento: ' + (error.error?.mensaje || error.message), 'Cerrar', { duration: 5000 });
          },
          complete: () => {
            this.nuevoMovimientoCargando = false;
          }
        });
    } else {
      this.marcarFormularioComoTocado(this.nuevoMovimientoForm);
      this.snackBar.open('Por favor, complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
  }

  obtenerTiposMovimiento(): { value: string; label: string; descripcion: string }[] {
    return [
      { value: 'AJUSTE_ENTRADA', label: 'Ajuste Entrada', descripcion: 'Aumentar stock manualmente' },
      { value: 'AJUSTE_SALIDA', label: 'Ajuste Salida', descripcion: 'Disminuir stock manualmente' },
      { value: 'DEVOLUCION_COMPRA', label: 'Devolución Compra', descripcion: 'Devolver producto a proveedor' },
      { value: 'DEVOLUCION_CLIENTE', label: 'Devolución Cliente', descripcion: 'Cliente devuelve producto' }
    ];
  }

  obtenerColorTipoMovimiento(tipo: string): string {
    const colores: { [key: string]: string } = {
      'AJUSTE_ENTRADA': 'text-green-600',
      'AJUSTE_SALIDA': 'text-red-600',
      'DEVOLUCION_COMPRA': 'text-orange-600',
      'DEVOLUCION_CLIENTE': 'text-blue-600'
    };
    return colores[tipo] || 'text-gray-600';
  }

  private marcarFormularioComoTocado(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

}