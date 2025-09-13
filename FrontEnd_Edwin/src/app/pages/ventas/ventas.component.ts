import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
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
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, startWith, map } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';

import { VentaService } from '../../services/venta.service';
import { ClienteService } from '../../services/cliente.service';
import { ProductoService } from '../../services/producto.service';
import { UsuarioService } from '../../services/usuario.service';
import { CajaService } from '../../services/caja.service';
import { 
  Venta, 
  VentaCreate, 
  VentaAnular, 
  VentaFiltros 
} from '../../models/venta.model';
import { Cliente } from '../../models/cliente.model';
import { Producto } from '../../models/producto.model';
import { Usuario } from '../../models/usuario.model';
import { Caja } from '../../models/caja.model';
import { ConfirmDialogComponent } from '../../components/confirm-dialog.component';

@Component({
  selector: 'app-ventas',
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
    MatStepperModule,
    MatAutocompleteModule
  ],
  templateUrl: './ventas.component.html'
})
export class VentasComponent implements OnInit {
  @ViewChild('ventaPaginator') ventaPaginator!: MatPaginator;
  @ViewChild('ventaSort') ventaSort!: MatSort;

  // Variables para ventas
  ventas: Venta[] = [];
  ventasDataSource = new MatTableDataSource<Venta>();
  ventasDisplayedColumns = ['id_venta', 'fecha', 'cliente', 'cajero', 'total', 'estado', 'acciones'];
  ventaForm!: FormGroup;
  ventaEditando: Venta | null = null;
  ventaModalAbierto = false;
  
  // Variables para modal de detalles
  ventaDetalleModalAbierto = false;
  ventaSeleccionada: Venta | null = null;
  detallesVentaSeleccionada: any[] = [];
  
  // Autocomplete para cliente
  clienteSearchControl = new FormControl();
  clientesFiltrados$!: Observable<Cliente[]>;
  
  // Autocomplete para productos (múltiples controles)
  productoSearchControls: FormControl[] = [];
  productosFiltrados$: Observable<Producto[]>[] = [];
  ventaCargando = false;
  ventaTotal = 0;
  ventaPagina = 1;
  ventaLimite = 10;
  ventaFiltros: VentaFiltros = {
    estado: '',
    cliente_id: undefined,
    usuario_id: undefined,
    caja_id: undefined,
    fecha_desde: '',
    fecha_hasta: '',
    busqueda: ''
  };

  // Variables para formulario de venta
  detallesVenta: any[] = [];
  productosParaDropdown: Producto[] = [];
  clientesParaDropdown: Cliente[] = [];
  usuariosParaDropdown: Usuario[] = [];
  cajaAbierta: Caja | null = null;

  // Variables generales
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private ventaService: VentaService,
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private usuarioService: UsuarioService,
    private cajaService: CajaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.cargarVentas();
    this.cargarClientesActivos();
    this.cargarProductosActivos();
    this.cargarUsuariosActivos();
    this.verificarCajaAbierta();
    this.configurarAutocompleteCliente();
    this.configurarAutocompleteProductos();
  }

  inicializarFormularios(): void {
    // Formulario principal de venta
    this.ventaForm = this.fb.group({
      cliente_id: [''],
      usuario_id: ['', [Validators.required]],
      fecha: [''],
      observacion: ['', [Validators.maxLength(300)]]
    });

    // Inicializar detalles vacíos
    this.detallesVenta = [];
  }

  // Métodos para ventas
  cargarVentas(): void {
    
    this.ventaCargando = true;
    this.ventaService.obtenerVentas(this.ventaPagina, this.ventaLimite, this.ventaFiltros)
      .subscribe({
        next: (response) => {
          
          this.ventas = response.datos.datos;
          this.ventasDataSource.data = this.ventas;
          // Si el total de paginación es 0 pero hay datos, usar la longitud de los datos
          this.ventaTotal = response.datos.paginacion.total > 0 ? response.datos.paginacion.total : this.ventas.length;
          this.ventaCargando = false;
          
        },
        error: (error) => {
          this.snackBar.open('Error al cargar ventas', 'Cerrar', { duration: 3000 });
          this.ventaCargando = false;
        }
      });
  }

  cargarClientesActivos(): void {
    this.clienteService.obtenerClientes(1, 100, { activo: 'true' })
      .subscribe({
        next: (response) => {
          this.clientesParaDropdown = response.datos.datos;
        },
        error: (error) => {
        }
      });
  }

  cargarProductosActivos(): void {
    this.productoService.obtenerProductos(1, 100, { activo: 'true' })
      .subscribe({
        next: (response) => {
          this.productosParaDropdown = response.datos.datos;
        },
        error: (error) => {
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
        }
      });
  }


  verificarCajaAbierta(): void {
    this.cajaService.verificarCajaAbierta()
      .subscribe({
        next: (response) => {
          if (response.datos.hay_caja_abierta) {
            this.obtenerCajaAbierta();
          } else {
            this.cajaAbierta = null;
          }
        },
        error: (error) => {
          this.cajaAbierta = null;
        }
      });
  }

  obtenerCajaAbierta(): void {
    this.cajaService.obtenerCajaAbierta()
      .subscribe({
        next: (response) => {
          this.cajaAbierta = response.datos;
        },
        error: (error) => {
          this.cajaAbierta = null;
        }
      });
  }

  abrirModalVenta(venta?: Venta): void {
    
    if (!this.cajaAbierta) {
      this.snackBar.open('No hay caja abierta. Debe abrir una caja antes de realizar ventas', 'Cerrar', { duration: 5000 });
      return;
    }

    this.ventaEditando = venta || null;
    this.ventaModalAbierto = true;
    
    if (venta) {
      this.ventaForm.patchValue({
        cliente_id: venta.cliente_id || '',
        usuario_id: venta.usuario_id,
        fecha: venta.fecha ? new Date(venta.fecha) : '',
        observacion: venta.observacion || ''
      });
      this.detallesVenta = venta.detalles || [];
      
      // Configurar cliente seleccionado en el autocomplete
      if (venta.cliente_id) {
        const cliente = this.clientesParaDropdown.find(c => c.id_cliente === venta.cliente_id);
        if (cliente) {
          this.clienteSearchControl.setValue(cliente);
        }
      }
    } else {
      this.ventaForm.reset({ 
        fecha: new Date(),
        usuario_id: this.usuariosParaDropdown[0]?.id_usuario || ''
      });
      this.detallesVenta = [];
      this.clienteSearchControl.setValue('');
      
      // Inicializar controles de productos para detalles existentes
      this.detallesVenta.forEach((_, index) => {
        this.getProductoSearchControl(index);
      });
    }
  }

  cerrarModalVenta(): void {
    this.ventaModalAbierto = false;
    this.ventaEditando = null;
    this.ventaForm.reset({ 
      fecha: new Date()
    });
    this.detallesVenta = [];
    this.clienteSearchControl.setValue('');
    
    // Limpiar controles de productos
    this.productoSearchControls = [];
    this.productosFiltrados$ = [];
  }

  guardarVenta(): void {
    if (this.ventaForm.valid && this.detallesVenta.length > 0) {
      const datosVenta = this.ventaForm.value;
      
      // Formatear fecha
      if (datosVenta.fecha) {
        datosVenta.fecha = datosVenta.fecha.toISOString();
      }

      const ventaData: VentaCreate = {
        ...datosVenta,
        estado: 'EMITIDA', // Siempre EMITIDA para nuevas ventas
        detalles: this.detallesVenta.map(detalle => ({
          id_producto: parseInt(detalle.id_producto),
          cantidad: parseInt(detalle.cantidad),
          precio_unitario: parseFloat(detalle.precio_unitario)
        }))
      };

      if (this.ventaEditando) {
        // Solo permitir anular ventas
        this.anularVenta(this.ventaEditando.id_venta);
      } else {
        this.crearVenta(ventaData);
      }
    } else {
      this.marcarFormularioComoTocado(this.ventaForm);
      if (this.detallesVenta.length === 0) {
        this.snackBar.open('Debe agregar al menos un detalle a la venta', 'Cerrar', { duration: 3000 });
      }
    }
  }

  crearVenta(datos: VentaCreate): void {
    this.ventaService.crearVenta(datos)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Venta creada correctamente', 'Cerrar', { duration: 3000 });
          this.cerrarModalVenta();
          this.cargarVentas();
          this.verificarCajaAbierta();
        },
        error: (error) => {
          this.snackBar.open('Error al crear venta', 'Cerrar', { duration: 3000 });
        }
      });
  }

  anularVenta(id: number): void {
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Anular Venta',
        mensaje: '¿Estás seguro de que deseas anular esta venta?',
        confirmarTexto: 'Anular',
        cancelarTexto: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ventaService.anularVenta(id, { motivo: 'Venta anulada por el usuario' })
          .subscribe({
            next: (response) => {
              this.snackBar.open('Venta anulada correctamente', 'Cerrar', { duration: 3000 });
              this.cerrarModalVenta();
              this.cargarVentas();
            },
            error: (error) => {
              this.snackBar.open('Error al anular venta', 'Cerrar', { duration: 3000 });
            }
          });
      } else {
      }
    });
  }

  // Métodos para detalles de la venta
  agregarDetalle(): void {
    const nuevoDetalle = {
      id_producto: '',
      cantidad: 1,
      precio_unitario: 0
    };
    this.detallesVenta.push(nuevoDetalle);
    
    // Inicializar control de búsqueda para el nuevo detalle
    const index = this.detallesVenta.length - 1;
    this.getProductoSearchControl(index);
    
  }

  eliminarDetalle(index: number): void {
    this.detallesVenta.splice(index, 1);
    
    // Limpiar controles de búsqueda
    this.productoSearchControls.splice(index, 1);
    this.productosFiltrados$.splice(index, 1);
  }

  calcularSubtotal(detalle: any): number {
    return detalle.cantidad * detalle.precio_unitario;
  }

  calcularTotalVenta(): number {
    return this.detallesVenta.reduce((total, detalle) => total + this.calcularSubtotal(detalle), 0);
  }

  // Métodos de filtros y paginación
  aplicarFiltrosVenta(): void {
    this.ventaPagina = 1;
    this.cargarVentas();
  }

  limpiarFiltrosVenta(): void {
    this.ventaFiltros = {
      estado: '',
      cliente_id: undefined,
      usuario_id: undefined,
      caja_id: undefined,
      fecha_desde: '',
      fecha_hasta: '',
      busqueda: ''
    };
    this.aplicarFiltrosVenta();
  }

  onVentaPageChange(event: PageEvent): void {
    this.ventaPagina = event.pageIndex + 1;
    this.ventaLimite = event.pageSize;
    this.cargarVentas();
  }

  // Métodos auxiliares
  marcarFormularioComoTocado(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.markAsTouched();
    });
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearPrecio(precio: any): string {
    if (precio === null || precio === undefined || precio === '') {
      return '$0.00';
    }
    
    const precioNumero = typeof precio === 'string' ? parseFloat(precio) : Number(precio);
    
    if (isNaN(precioNumero)) {
      return '$0.00';
    }
    
    return `$${precioNumero.toFixed(2)}`;
  }

  obtenerColorEstado(estado: string): string {
    switch (estado) {
      case 'EMITIDA': return 'primary';
      case 'ANULADA': return 'warn';
      default: return 'primary';
    }
  }

  obtenerNombreProducto(idProducto: number): string {
    const producto = this.productosParaDropdown.find(p => p.id_producto === idProducto);
    return producto ? producto.nombre : 'Producto no encontrado';
  }

  obtenerPrecioProducto(idProducto: number): number {
    const producto = this.productosParaDropdown.find(p => p.id_producto === idProducto);
    return producto ? producto.precio_unitario : 0;
  }

  onProductoChange(detalle: any): void {
    if (detalle.id_producto) {
      const precio = this.obtenerPrecioProducto(detalle.id_producto);
      detalle.precio_unitario = precio;
    }
  }

  // Métodos para autocomplete de cliente
  configurarAutocompleteCliente(): void {
    this.clientesFiltrados$ = this.clienteSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (typeof value === 'string') {
          return this.filtrarClientes(value);
        }
        return this.clientesParaDropdown;
      })
    );
  }

  filtrarClientes(value: string): Cliente[] {
    if (!value) {
      return this.clientesParaDropdown;
    }
    
    const filterValue = value.toLowerCase();
    return this.clientesParaDropdown.filter(cliente => 
      cliente.nombres?.toLowerCase().includes(filterValue) ||
      cliente.apellidos?.toLowerCase().includes(filterValue) ||
      cliente.email?.toLowerCase().includes(filterValue)
    );
  }

  displayClienteFn(cliente: Cliente): string {
    return cliente ? `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim() : '';
  }

  onClienteSelected(event: any): void {
    const cliente = event.option.value;
    if (cliente) {
      this.ventaForm.patchValue({ cliente_id: cliente.id_cliente });
    }
  }

  // Métodos para autocomplete de productos
  configurarAutocompleteProductos(): void {
    // Inicializar con un control vacío
    this.productoSearchControls = [];
    this.productosFiltrados$ = [];
  }

  getProductoSearchControl(index: number): FormControl {
    // Crear control si no existe
    if (!this.productoSearchControls[index]) {
      this.productoSearchControls[index] = new FormControl();
      this.productosFiltrados$[index] = this.productoSearchControls[index].valueChanges.pipe(
        startWith(''),
        map(value => {
          if (typeof value === 'string') {
            return this.filtrarProductos(value);
          }
          return this.productosParaDropdown;
        })
      );
    }
    return this.productoSearchControls[index];
  }

  getProductosFiltrados(index: number): Observable<Producto[]> {
    return this.productosFiltrados$[index] || new Observable(observer => observer.next([]));
  }

  filtrarProductos(value: string): Producto[] {
    if (!value) {
      return this.productosParaDropdown;
    }
    
    const filterValue = value.toLowerCase();
    return this.productosParaDropdown.filter(producto => 
      producto.nombre?.toLowerCase().includes(filterValue)
    );
  }

  displayProductoFn(producto: Producto): string {
    return producto ? producto.nombre : '';
  }

  onProductoSelected(event: any, detalle: any): void {
    
    const producto = event.option.value;
    
    if (producto) {
      
      // Asignar ID del producto
      detalle.id_producto = producto.id_producto;
      
      // Intentar diferentes formas de obtener el precio
      let precio = 0;
      if (producto.precio_unitario !== undefined && producto.precio_unitario !== null && producto.precio_unitario !== '') {
        precio = parseFloat(producto.precio_unitario);
      } else if (producto.precio_venta !== undefined && producto.precio_venta !== null && producto.precio_venta !== '') {
        precio = parseFloat(producto.precio_venta);
      } else if (producto.precio !== undefined && producto.precio !== null && producto.precio !== '') {
        precio = parseFloat(producto.precio);
      } else {
      }
      
      // Asignar el precio al detalle
      detalle.precio_unitario = precio;
      
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
      
      // Verificar después de un pequeño delay
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 100);
    } else {
    }
  }

  // Método para obtener el precio formateado
  getPrecioFormateado(detalle: any): string {
    
    if (detalle.precio_unitario && detalle.precio_unitario > 0) {
      return detalle.precio_unitario.toString();
    }
    return '0';
  }

  // Método para manejar cambios en cantidad
  onCantidadChange(event: any, detalle: any): void {
    detalle.cantidad = parseInt(event.target.value) || 1;
  }

  // Método para ver detalle de venta
  verDetalleVenta(idVenta: number): void {
    
    // Buscar la venta en la lista actual
    this.ventaSeleccionada = this.ventas.find(v => v.id_venta === idVenta) || null;
    
    if (this.ventaSeleccionada) {
      
      // Cargar detalles de la venta
      this.cargarDetallesVenta(idVenta);
      
      // Abrir modal
      this.ventaDetalleModalAbierto = true;
    } else {
      this.snackBar.open('Venta no encontrada', 'Cerrar', { duration: 3000 });
    }
  }

  // Método para cargar detalles de una venta específica
  cargarDetallesVenta(idVenta: number): void {
    
    this.ventaService.obtenerVenta(idVenta)
      .subscribe({
        next: (response) => {
          // Aquí podrías cargar los detalles específicos si el backend los devuelve
          // Por ahora, simularemos algunos datos de ejemplo
          this.detallesVentaSeleccionada = [
            {
              nombre_producto: 'Producto de Ejemplo',
              sku: 'SKU-001',
              cantidad: 2,
              precio_unitario: 10.50
            }
          ];
        },
        error: (error) => {
          this.snackBar.open('Error al cargar detalles de la venta', 'Cerrar', { duration: 3000 });
        }
      });
  }

  // Método para cerrar modal de detalles
  cerrarModalDetalleVenta(): void {
    this.ventaDetalleModalAbierto = false;
    this.ventaSeleccionada = null;
    this.detallesVentaSeleccionada = [];
  }

}