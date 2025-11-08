import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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

import { PedidoService } from '../../services/pedido.service';
import { ProveedorService } from '../../services/proveedor.service';
import { ProductoService } from '../../services/producto.service';
import { UsuarioService } from '../../services/usuario.service';
import { 
  Pedido, 
  PedidoCreate, 
  PedidoUpdate, 
  PedidoEstadisticas,
  PedidoFiltros 
} from '../../models/pedido.model';
import { Proveedor } from '../../models/proveedor.model';
import { Producto } from '../../models/producto.model';
import { Usuario } from '../../models/usuario.model';
import { ConfirmDialogComponent } from '../../components/confirm-dialog.component';

@Component({
  selector: 'app-gestion-pedido',
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
  templateUrl: './gestion-pedido.component.html'
})
export class GestionPedidoComponent implements OnInit {
  @ViewChild('pedidoPaginator') pedidoPaginator!: MatPaginator;
  @ViewChild('pedidoSort') pedidoSort!: MatSort;

  // Variables para pedidos
  pedidos: Pedido[] = [];
  pedidosDataSource = new MatTableDataSource<Pedido>();
  pedidosDisplayedColumns = ['id_pedido', 'proveedor_nombre', 'fecha_pedido', 'estado', 'pendiente', 'total_costo', 'usuario_nombre', 'acciones'];
  pedidoForm!: FormGroup;
  pedidoEditando: Pedido | null = null;
  pedidoModalAbierto = false;
  estadoEditable = true; // Controla si el campo estado es editable
  pedidoCargando = false;
  pedidoTotal = 0;
  pedidoPagina = 1;
  pedidoLimite = 10;
  pedidoFiltros: PedidoFiltros = {
    estado: '',
    proveedor_id: undefined,
    fecha_desde: '',
    fecha_hasta: '',
    busqueda: ''
  };

  // Variables para formulario de pedido
  detallesPedido: any[] = [];
  productosParaDropdown: Producto[] = [];
  proveedoresParaDropdown: Proveedor[] = [];
  usuariosParaDropdown: Usuario[] = [];

  // Variables para modal de recepción de pedido
  recibirPedidoModalAbierto = false;
  pedidoRecibir: Pedido | null = null;
  detallesConFechas: Array<{
    id_producto: number;
    fecha_vencimiento: Date | null;
    numero_lote: string;
  }> = [];

  // Variables para estadísticas
  estadisticas: PedidoEstadisticas | null = null;

  // Variables generales
  cargando = false;
  minDate = new Date(); // Fecha mínima para datepicker (hoy)

  constructor(
    private fb: FormBuilder,
    private pedidoService: PedidoService,
    private proveedorService: ProveedorService,
    private productoService: ProductoService,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.cargarPedidos();
    this.cargarProveedoresActivos();
    this.cargarProductosActivos();
    this.cargarUsuariosActivos();
    this.cargarEstadisticas();
    
    // Escuchar cambios en el formulario para activar el botón
    this.pedidoForm.valueChanges.subscribe(() => {
      // Forzar detección de cambios
      this.cd.detectChanges();
    });
  }

  inicializarFormularios(): void {
    // Formulario principal de pedido
    this.pedidoForm = this.fb.group({
      proveedor_id: ['', [Validators.required]],
      usuario_id: ['', [Validators.required]],
      fecha_pedido: [''],
      estado: ['CREADO'],
      observacion: ['', [Validators.maxLength(300)]]
    });

    // Inicializar detalles vacíos
    this.detallesPedido = [];
  }

  // Métodos para pedidos
  cargarPedidos(): void {
    this.pedidoCargando = true;
    this.pedidoService.obtenerPedidos(this.pedidoPagina, this.pedidoLimite, this.pedidoFiltros)
      .subscribe({
        next: (response) => {
          const pedidos = response.datos.datos || [];
          let total = response.datos.paginacion?.total || 0;
          
          // WORKAROUND: Si el backend devuelve total=0 pero hay datos
          if (total === 0 && pedidos.length > 0) {
            if (pedidos.length === this.pedidoLimite) {
              total = this.pedidoPagina * this.pedidoLimite + 1;
            } else {
              total = (this.pedidoPagina - 1) * this.pedidoLimite + pedidos.length;
            }
          }
          
          this.pedidos = pedidos;
          this.pedidosDataSource.data = this.pedidos;
          this.pedidoTotal = total;
          this.pedidoCargando = false;
        },
        error: (error) => {
          console.error('Error al cargar pedidos:', error);
          this.snackBar.open('Error al cargar pedidos: ' + (error.error?.mensaje || error.message), 'Cerrar', { duration: 5000 });
          this.pedidoCargando = false;
        }
      });
  }

  cargarProveedoresActivos(): void {
    this.proveedorService.obtenerProveedores(1, 100, { activo: 'true' })
      .subscribe({
        next: (response: any) => {
          this.proveedoresParaDropdown = response.datos.datos;
        },
        error: (error: any) => {
          console.error('Error al cargar proveedores:', error);
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
    this.pedidoService.obtenerEstadisticasPedidos()
      .subscribe({
        next: (response) => {
          this.estadisticas = response.datos;
        },
        error: (error) => {
          console.error('Error al cargar estadísticas:', error);
        }
      });
  }

  abrirModalPedido(pedido?: Pedido): void {
    this.pedidoEditando = pedido || null;
    this.pedidoModalAbierto = true;
    
    if (pedido) {
      this.estadoEditable = true; // Al editar, el estado es editable
      this.pedidoForm.patchValue({
        proveedor_id: pedido.proveedor_id,
        usuario_id: pedido.usuario_id,
        fecha_pedido: pedido.fecha_pedido ? new Date(pedido.fecha_pedido) : '',
        estado: pedido.estado,
        observacion: pedido.observacion || ''
      });
      
      // Cargar detalles del pedido
      this.detallesPedido = pedido.detalles || [];
      
      // Validar estado para edición
      this.validarEstadoEdicion(pedido);
      
      // Marcar el formulario como modificado para activar el botón
      this.pedidoForm.markAsDirty();
    } else {
      this.estadoEditable = false; // Al crear, el estado no es editable
      this.pedidoForm.reset({ 
        estado: 'CREADO',
        fecha_pedido: new Date()
      });
      this.detallesPedido = [];
      
      // Validar estado para nuevo pedido
      this.validarEstadoNuevoPedido();
    }
  }

  cerrarModalPedido(): void {
    this.pedidoModalAbierto = false;
    this.pedidoEditando = null;
    this.pedidoForm.reset({ 
      estado: 'CREADO',
      fecha_pedido: new Date()
    });
    this.detallesPedido = [];
  }

  guardarPedido(): void {
    if (this.pedidoForm.valid && this.detallesPedido.length > 0) {
      const datosPedido = this.pedidoForm.value;
      
      // Formatear fecha - verificar que sea un objeto Date válido
      if (datosPedido.fecha_pedido) {
        if (datosPedido.fecha_pedido instanceof Date) {
          datosPedido.fecha_pedido = datosPedido.fecha_pedido.toISOString();
        } else if (typeof datosPedido.fecha_pedido === 'string') {
          // Si ya es string, usar tal como está
          datosPedido.fecha_pedido = datosPedido.fecha_pedido;
        } else {
          // Si no es ni Date ni string, usar fecha actual
          datosPedido.fecha_pedido = new Date().toISOString();
        }
      } else {
        // Si no hay fecha, usar fecha actual
        datosPedido.fecha_pedido = new Date().toISOString();
      }

      const pedidoData: PedidoCreate = {
        ...datosPedido,
        detalles: this.detallesPedido.map(detalle => ({
          id_producto: detalle.id_producto,
          cantidad: detalle.cantidad,
          costo_unitario: detalle.costo_unitario
        }))
      };

      if (this.pedidoEditando) {
        this.actualizarEstadoPedido(this.pedidoEditando, pedidoData.estado!);
      } else {
        this.crearPedido(pedidoData);
      }
    } else {
      this.marcarFormularioComoTocado(this.pedidoForm);
      if (this.detallesPedido.length === 0) {
        this.snackBar.open('Debe agregar al menos un detalle al pedido', 'Cerrar', { duration: 3000 });
      }
    }
  }

  crearPedido(datos: PedidoCreate): void {
    this.pedidoService.crearPedido(datos)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Pedido creado correctamente', 'Cerrar', { duration: 3000 });
          this.cerrarModalPedido();
          this.cargarPedidos();
          this.cargarEstadisticas();
        },
        error: (error) => {
          console.error('Error al crear pedido:', error);
          this.snackBar.open('Error al crear pedido: ' + (error.error?.mensaje || error.message), 'Cerrar', { duration: 5000 });
        }
      });
  }


  // Métodos para detalles del pedido
  agregarDetalle(): void {
    this.detallesPedido.push({
      id_producto: '',
      cantidad: 1,
      costo_unitario: 0
    });
  }

  eliminarDetalle(index: number): void {
    this.detallesPedido.splice(index, 1);
  }

  calcularSubtotal(detalle: any): number {
    const cantidad = parseFloat(detalle.cantidad) || 0;
    const costo = parseFloat(detalle.costo_unitario) || 0;
    const subtotal = cantidad * costo;
    return Math.round(subtotal * 100) / 100; // Redondear a 2 decimales
  }

  calcularTotalPedido(): number {
    return this.detallesPedido.reduce((total, detalle) => total + this.calcularSubtotal(detalle), 0);
  }

  // Métodos de filtros y paginación
  aplicarFiltrosPedido(): void {
    this.pedidoPagina = 1;
    this.cargarPedidos();
  }

  limpiarFiltrosPedido(): void {
    this.pedidoFiltros = {
      estado: '',
      proveedor_id: undefined,
      fecha_desde: '',
      fecha_hasta: '',
      busqueda: ''
    };
    this.aplicarFiltrosPedido();
  }

  onPedidoPageChange(event: PageEvent): void {
    this.pedidoPagina = event.pageIndex + 1;
    this.pedidoLimite = event.pageSize;
    this.cargarPedidos();
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
      return 'Q0.00';
    }
    
    const precioNumero = typeof precio === 'string' ? parseFloat(precio) : Number(precio);
    
    if (isNaN(precioNumero)) {
      return 'Q0.00';
    }
    
    return `Q${precioNumero.toFixed(2)}`;
  }

  obtenerColorEstado(estado: string): string {
    switch (estado) {
      case 'CREADO': return 'primary';
      case 'ENVIADO': return 'accent';
      case 'RECIBIDO': return 'primary';
      case 'CANCELADO': return 'warn';
      default: return 'primary';
    }
  }

  obtenerCantidadDetalle(idProducto: number): number {
    if (!this.pedidoRecibir?.detalles) {
      return 0;
    }
    const detalle = this.pedidoRecibir.detalles.find(d => d.id_producto === idProducto);
    return detalle?.cantidad || 0;
  }

  obtenerNombreProducto(idProducto: number): string {
    const producto = this.productosParaDropdown.find(p => p.id_producto === idProducto);
    return producto ? producto.nombre : 'Producto no encontrado';
  }

  onProductoChange(event: any, detalle: any): void {
    // Cuando se selecciona un producto, se puede cargar información adicional
    // como el precio unitario por defecto
    detalle.id_producto = event.value;
    const producto = this.productosParaDropdown.find(p => p.id_producto === detalle.id_producto);
    if (producto) {
      detalle.costo_unitario = producto.precio_unitario || 0;
      this.recalcularSubtotal(detalle);
    }
  }

  onCantidadInput(event: any, detalle: any): void {
    detalle.cantidad = parseFloat(event.target.value) || 0;
    this.recalcularSubtotal(detalle);
  }

  onCostoInput(event: any, detalle: any): void {
    detalle.costo_unitario = parseFloat(event.target.value) || 0;
    this.recalcularSubtotal(detalle);
  }

  recalcularSubtotal(detalle: any): void {
    if (detalle.cantidad && detalle.costo_unitario) {
      detalle.subtotal = this.calcularSubtotal(detalle);
    } else {
      detalle.subtotal = 0;
    }
    // Forzar detección de cambios
    this.detallesPedido = [...this.detallesPedido];
  }

  onCantidadChange(detalle: any): void {
    // Recalcular subtotal cuando cambia la cantidad
    if (detalle.cantidad && detalle.costo_unitario) {
      detalle.subtotal = this.calcularSubtotal(detalle);
    }
    // Forzar detección de cambios
    this.detallesPedido = [...this.detallesPedido];
  }

  onCostoChange(detalle: any): void {
    // Recalcular subtotal cuando cambia el costo unitario
    if (detalle.cantidad && detalle.costo_unitario) {
      detalle.subtotal = this.calcularSubtotal(detalle);
    }
    // Forzar detección de cambios
    this.detallesPedido = [...this.detallesPedido];
  }

  // ===== MÉTODOS PARA MANEJO DE ESTADOS =====

  /**
   * Valida si una transición de estado es válida
   */
  esTransicionValida(estadoActual: string, nuevoEstado: string): boolean {
    const transicionesValidas: { [key: string]: string[] } = {
      'CREADO': ['ENVIADO', 'CANCELADO'],
      'ENVIADO': ['RECIBIDO', 'CANCELADO'],
      'RECIBIDO': [], // No puede cambiar de estado
      'CANCELADO': [] // No puede cambiar de estado
    };

    return transicionesValidas[estadoActual]?.includes(nuevoEstado) || false;
  }

  /**
   * Obtiene los estados disponibles para un pedido según su estado actual
   */
  obtenerEstadosDisponibles(estadoActual: string): string[] {
    const transicionesValidas: { [key: string]: string[] } = {
      'CREADO': ['ENVIADO', 'CANCELADO'],
      'ENVIADO': ['RECIBIDO', 'CANCELADO'],
      'RECIBIDO': [],
      'CANCELADO': []
    };

    return transicionesValidas[estadoActual] || [];
  }

  /**
   * Obtiene el texto descriptivo para un estado
   */
  obtenerTextoEstado(estado: string): string {
    const textos: { [key: string]: string } = {
      'CREADO': 'Creado',
      'ENVIADO': 'Enviado',
      'RECIBIDO': 'Recibido',
      'CANCELADO': 'Cancelado'
    };

    return textos[estado] || estado;
  }

  /**
   * Obtiene el icono para un estado
   */
  obtenerIconoEstado(estado: string): string {
    const iconos: { [key: string]: string } = {
      'CREADO': 'add_circle',
      'ENVIADO': 'send',
      'RECIBIDO': 'inventory',
      'CANCELADO': 'cancel'
    };

    return iconos[estado] || 'help';
  }

  /**
   * Valida el estado al crear un nuevo pedido
   */
  validarEstadoNuevoPedido(): void {
    // Los nuevos pedidos siempre deben ser CREADO
    this.pedidoForm.patchValue({ estado: 'CREADO' });
  }

  /**
   * Valida el estado al editar un pedido existente
   */
  validarEstadoEdicion(pedido: Pedido): void {
    // Solo permitir estados válidos según el estado actual
    const estadosDisponibles = this.obtenerEstadosDisponibles(pedido.estado);
    
    // Si el pedido no puede cambiar de estado, deshabilitar el campo
    if (estadosDisponibles.length === 0) {
      this.pedidoForm.get('estado')?.disable();
    } else {
      this.pedidoForm.get('estado')?.enable();
    }
  }

  /**
   * Maneja el cambio de estado en el formulario
   */
  onEstadoChange(event: any): void {
    const nuevoEstado = event.value;
    const pedidoActual = this.pedidoEditando;
    
    if (pedidoActual) {
      const estadoActual = pedidoActual.estado;
      
      if (!this.esTransicionValida(estadoActual, nuevoEstado)) {
        // Revertir al estado anterior si la transición no es válida
        this.snackBar.open(
          `No se puede cambiar de ${this.obtenerTextoEstado(estadoActual)} a ${this.obtenerTextoEstado(nuevoEstado)}`,
          'Cerrar',
          { duration: 3000 }
        );
        
        this.pedidoForm.patchValue({ estado: estadoActual });
        return;
      }
    }
  }

  /**
   * Actualiza el estado de un pedido
   */
  actualizarEstadoPedido(pedido: Pedido, nuevoEstado: string): void {
    if (!this.esTransicionValida(pedido.estado, nuevoEstado)) {
      this.snackBar.open(
        `No se puede cambiar de ${this.obtenerTextoEstado(pedido.estado)} a ${this.obtenerTextoEstado(nuevoEstado)}`,
        'Cerrar',
        { duration: 3000 }
      );
      return;
    }

    // Si es RECIBIDO, abrir modal para fechas de vencimiento
    if (nuevoEstado === 'RECIBIDO') {
      this.abrirModalRecibirPedido(pedido);
    } else if (nuevoEstado === 'CANCELADO') {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          titulo: 'Confirmar cancelación',
          mensaje: '¿Estás seguro de que quieres cancelar este pedido?',
          confirmarTexto: 'Sí, cancelar',
          cancelarTexto: 'No'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.ejecutarCambioEstado(pedido, nuevoEstado);
        }
      });
    } else {
      this.ejecutarCambioEstado(pedido, nuevoEstado);
    }
  }

  /**
   * Abre el modal para recibir pedido con fechas de vencimiento
   */
  abrirModalRecibirPedido(pedido: Pedido): void {
    // Cargar detalles completos del pedido si no están cargados
    if (!pedido.detalles || pedido.detalles.length === 0) {
      this.pedidoService.obtenerPedido(pedido.id_pedido).subscribe({
        next: (response) => {
          this.pedidoRecibir = response.datos;
          this.inicializarDetallesConFechas();
          this.recibirPedidoModalAbierto = true;
        },
        error: (error) => {
          console.error('Error al cargar detalles del pedido:', error);
          this.snackBar.open('Error al cargar detalles del pedido', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.pedidoRecibir = pedido;
      this.inicializarDetallesConFechas();
      this.recibirPedidoModalAbierto = true;
    }
  }

  /**
   * Inicializa el array de detalles con fechas
   */
  inicializarDetallesConFechas(): void {
    if (!this.pedidoRecibir || !this.pedidoRecibir.detalles) return;
    
    this.detallesConFechas = this.pedidoRecibir.detalles.map(detalle => ({
      id_producto: detalle.id_producto,
      fecha_vencimiento: null,
      numero_lote: ''
    }));
  }

  /**
   * Cierra el modal de recepción
   */
  cerrarModalRecibirPedido(): void {
    this.recibirPedidoModalAbierto = false;
    this.pedidoRecibir = null;
    this.detallesConFechas = [];
  }

  /**
   * Confirma la recepción del pedido con fechas de vencimiento
   */
  confirmarRecepcionPedido(): void {
    if (!this.pedidoRecibir) return;

    // Formatear fechas para enviar al backend
    const detallesConFechasFormateadas = this.detallesConFechas.map(detalle => ({
      id_producto: detalle.id_producto,
      fecha_vencimiento: detalle.fecha_vencimiento 
        ? detalle.fecha_vencimiento.toISOString().split('T')[0] 
        : null,
      numero_lote: detalle.numero_lote?.trim() || null
    }));

    this.ejecutarCambioEstado(
      this.pedidoRecibir, 
      'RECIBIDO',
      detallesConFechasFormateadas
    );
    
    this.cerrarModalRecibirPedido();
  }

  /**
   * Ejecuta el cambio de estado del pedido
   */
  private ejecutarCambioEstado(
    pedido: Pedido, 
    nuevoEstado: string, 
    detallesConFechas?: Array<{ id_producto: number; fecha_vencimiento: string | null; numero_lote: string | null }>
  ): void {
    const estadoUpdate: PedidoUpdate = { 
      estado: nuevoEstado as any,
      detallesConFechas: detallesConFechas
    };
    
    this.pedidoService.actualizarEstadoPedido(pedido.id_pedido, estadoUpdate)
      .subscribe({
        next: (response) => {
          this.snackBar.open(
            `Pedido ${nuevoEstado.toLowerCase()} correctamente`,
            'Cerrar',
            { duration: 3000 }
          );
          this.cargarPedidos();
          this.cargarEstadisticas();
        },
        error: (error) => {
          console.error('Error al actualizar estado:', error);
          this.snackBar.open(
            'Error al actualizar el estado del pedido: ' + (error.error?.mensaje || error.message),
            'Cerrar',
            { duration: 5000 }
          );
        }
      });
  }

  /**
   * Obtiene las acciones disponibles para un pedido
   */
  obtenerAccionesDisponibles(pedido: Pedido): { estado: string; texto: string; icono: string; color: string }[] {
    const estadosDisponibles = this.obtenerEstadosDisponibles(pedido.estado);
    
    return estadosDisponibles.map(estado => ({
      estado,
      texto: this.obtenerTextoEstado(estado),
      icono: this.obtenerIconoEstado(estado),
      color: this.obtenerColorEstado(estado)
    }));
  }
}