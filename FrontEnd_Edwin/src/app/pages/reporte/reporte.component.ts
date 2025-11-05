import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReporteService, FiltrosReporte, RespuestaReporte } from '../../services/reporte.service';
import { ClienteService } from '../../services/cliente.service';
import { UsuarioService } from '../../services/usuario.service';
import { ProductoService } from '../../services/producto.service';
import { ProveedorService } from '../../services/proveedor.service';
import { CategoriaService } from '../../services/categoria.service';
import { MarcaService } from '../../services/marca.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule
  ],
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css']
})
export class ReporteComponent implements OnInit {
  // Configuración de tabs
  tabs = [
    {
      label: 'Reportes Básicos',
      icon: 'assessment',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Reportes Operativos',
      icon: 'business_center',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Reportes Avanzados',
      icon: 'trending_up',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  // Configuración de reportes por categoría
  reportesBasicos = [
    {
      titulo: 'Ventas por Período',
      descripcion: 'Análisis de ventas en un rango de fechas específico',
      icono: 'point_of_sale',
      endpoint: 'ventas/por-periodo',
      filtros: ['desde', 'hasta', 'estado', 'usuario_id', 'cliente_id']
    },
    {
      titulo: 'Stock Actual',
      descripcion: 'Estado actual del inventario y productos',
      icono: 'inventory',
      endpoint: 'inventario/stock-actual',
      filtros: ['categoria_id', 'marca_id', 'stock_bajo']
    },
    // {
    //   titulo: 'Resumen Diario de Caja',
    //   descripcion: 'Resumen de operaciones de caja por día',
    //   icono: 'account_balance_wallet',
    //   endpoint: 'caja/resumen-diario',
    //   filtros: ['fecha']
    // }
  ];

  reportesOperativos = [
    {
      titulo: 'Pedidos por Estado',
      descripcion: 'Análisis de pedidos según su estado actual',
      icono: 'local_shipping',
      endpoint: 'pedidos/por-estado',
      filtros: ['desde', 'hasta', 'estado', 'proveedor_id']
    },
    {
      titulo: 'Productos por Categoría',
      descripcion: 'Distribución de productos por categorías',
      icono: 'category',
      endpoint: 'productos/por-categoria',
      filtros: ['activo']
    },
    {
      titulo: 'Clientes Más Frecuentes',
      descripcion: 'Ranking de clientes por frecuencia de compras',
      icono: 'people',
      endpoint: 'clientes/mas-frecuentes',
      filtros: ['desde', 'hasta', 'limite']
    }
  ];

  reportesAvanzados = [
    {
      titulo: 'Ingresos por Período',
      descripcion: 'Análisis financiero de ingresos generados',
      icono: 'attach_money',
      endpoint: 'financieros/ingresos-por-periodo',
      filtros: ['desde', 'hasta']
    },
    // {
    //   titulo: 'Análisis de Proveedores',
    //   descripcion: 'Evaluación del rendimiento de proveedores',
    //   icono: 'business',
    //   endpoint: 'pedidos/analisis-proveedores',
    //   filtros: ['desde', 'hasta']
    // },
    // {
    //   titulo: 'Dashboard Ejecutivo',
    //   descripcion: 'Vista general de métricas clave del negocio',
    //   icono: 'dashboard',
    //   endpoint: 'dashboard-ejecutivo',
    //   filtros: ['desde', 'hasta']
    // }
  ];

  // Estado del componente
  tabActivo = 0;
  reporteSeleccionado: any = null;
  datos: any[] = [];
  cargando = false;
  totalRegistros = 0;
  paginaActual = 0;
  tamanioPagina = 10;

  // Filtros
  filtros: FiltrosReporte = {
    desde: '',
    hasta: '',
    estado: '',
    usuario_id: undefined,
    cliente_id: undefined,
    proveedor_id: undefined,
    categoria_id: undefined,
    marca_id: undefined,
    tipo: '',
    producto_id: undefined,
    limite: 10,
    dias: 30,
    stock_bajo: false,
    activo: true
  };

  // Opciones para dropdowns
  estadosVenta = [
    { valor: 'EMITIDA', texto: 'Emitida' },
    { valor: 'ANULADA', texto: 'Anulada' }
  ];

  estadosPedido = [
    { valor: 'CREADO', texto: 'Creado' },
    { valor: 'ENVIADO', texto: 'Enviado' },
    { valor: 'RECIBIDO', texto: 'Recibido' },
    { valor: 'CANCELADO', texto: 'Cancelado' }
  ];

  estadosCaja = [
    { valor: 'ABIERTO', texto: 'Abierto' },
    { valor: 'CERRADO', texto: 'Cerrado' }
  ];

  tiposMovimiento = [
    { valor: 'ENTRADA_COMPRA', texto: 'Entrada por Compra' },
    { valor: 'SALIDA_VENTA', texto: 'Salida por Venta' },
    { valor: 'AJUSTE_ENTRADA', texto: 'Ajuste de Entrada' },
    { valor: 'AJUSTE_SALIDA', texto: 'Ajuste de Salida' },
    { valor: 'DEVOLUCION_COMPRA', texto: 'Devolución de Compra' },
    { valor: 'DEVOLUCION_CLIENTE', texto: 'Devolución de Cliente' }
  ];

  estadosProveedor = [
    { valor: 'ACTIVO', texto: 'Activo' },
    { valor: 'INACTIVO', texto: 'Inactivo' }
  ];

  // Datos para dropdowns
  usuarios: any[] = [];
  clientes: any[] = [];
  proveedores: any[] = [];
  proveedoresFiltrados: any[] = [];
  categorias: any[] = [];
  marcas: any[] = [];
  productos: any[] = [];

  // Variables para dropdown de proveedores
  busquedaProveedor: string = '';
  mostrarDropdownProveedores: boolean = false;
  proveedorSeleccionado: any = null;

  // Variables para dropdown de usuarios
  busquedaUsuario: string = '';
  mostrarDropdownUsuarios: boolean = false;
  usuarioSeleccionado: any = null;
  usuariosFiltrados: any[] = [];

  // Variables para dropdown de clientes
  busquedaCliente: string = '';
  mostrarDropdownClientes: boolean = false;
  clienteSeleccionado: any = null;
  clientesFiltrados: any[] = [];

  // Columnas de la tabla
  columnas: any[] = [];
  columnasMostradas: string[] = [];

  // Variables para los datepickers
  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;
  fechaEspecifica: Date | null = null;
  fechaMinima: string = '';
  fechaMaxima: string = '';

  // Variables para posicionamiento de dropdowns

  constructor(
    private reporteService: ReporteService,
    private clienteService: ClienteService,
    private usuarioService: UsuarioService,
    private productoService: ProductoService,
    private proveedorService: ProveedorService,
    private categoriaService: CategoriaService,
    private marcaService: MarcaService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.cargarDatosIniciales();
    this.establecerFechasPorDefecto();

    // Agregar listener para cerrar dropdowns al hacer click fuera
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative') && !target.closest('.dropdown-flotante')) {
        this.mostrarDropdownUsuarios = false;
        this.mostrarDropdownClientes = false;
        this.mostrarDropdownProveedores = false;
      }
    });
  }

  cargarDatosIniciales() {
    // Cargar usuarios
    this.usuarioService.obtenerUsuarios(1, 100).subscribe({
      next: (response: any) => {
        // Intentar diferentes estructuras de respuesta
        let usuariosData = [];
        if (response.datos) {
          if (response.datos.datos) {
            usuariosData = response.datos.datos;
          } else if (response.datos.usuarios) {
            usuariosData = response.datos.usuarios;
          } else if (Array.isArray(response.datos)) {
            usuariosData = response.datos;
          }
        }

        this.usuarios = usuariosData;
        this.usuariosFiltrados = [...this.usuarios];

        if (this.usuarios.length === 0) {
          console.warn('No se cargaron usuarios. Verificar estructura de respuesta del backend');
        }
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
        this.usuarios = [];
        this.usuariosFiltrados = [];
      }
    });

    // Cargar clientes
    this.clienteService.obtenerClientes(1, 100).subscribe({
      next: (response: any) => {
        // Intentar diferentes estructuras de respuesta
        let clientesData = [];
        if (response.datos) {
          if (response.datos.datos) {
            clientesData = response.datos.datos;
          } else if (response.datos.clientes) {
            clientesData = response.datos.clientes;
          } else if (Array.isArray(response.datos)) {
            clientesData = response.datos;
          }
        }

        this.clientes = clientesData;
        this.clientesFiltrados = [...this.clientes];

        if (this.clientes.length === 0) {
          console.warn('No se cargaron clientes. Verificar estructura de respuesta del backend');
        }
      },
      error: (error: any) => {
        console.error('Error al cargar clientes:', error);
        this.clientes = [];
        this.clientesFiltrados = [];
      }
    });

    // Cargar proveedores
    this.proveedorService.obtenerProveedores(1, 100).subscribe({
      next: (response: any) => {
        // Intentar diferentes estructuras de respuesta
        let proveedoresData = [];
        if (response.datos) {
          if (response.datos.datos) {
            proveedoresData = response.datos.datos;
          } else if (response.datos.proveedores) {
            proveedoresData = response.datos.proveedores;
          } else if (Array.isArray(response.datos)) {
            proveedoresData = response.datos;
          }
        }
        this.proveedores = proveedoresData;
        this.proveedoresFiltrados = [...this.proveedores];
        console.log('Proveedores cargados:', this.proveedores);
      },
      error: (error: any) => {
        console.error('Error al cargar proveedores:', error);
        this.proveedores = [];
        this.proveedoresFiltrados = [];
      }
    });

    // Cargar categorías
    this.categoriaService.obtenerCategorias(1, 100).subscribe({
      next: (response: any) => {
        // Intentar diferentes estructuras de respuesta
        let categoriasData = [];
        if (response.datos) {
          if (response.datos.datos) {
            categoriasData = response.datos.datos;
          } else if (response.datos.categorias) {
            categoriasData = response.datos.categorias;
          } else if (Array.isArray(response.datos)) {
            categoriasData = response.datos;
          }
        }
        this.categorias = categoriasData;
        console.log('Categorías cargadas:', this.categorias);
      },
      error: (error: any) => {
        console.error('Error al cargar categorías:', error);
        this.categorias = [];
      }
    });

    // Cargar marcas
    this.marcaService.obtenerMarcas(1, 100).subscribe({
      next: (response: any) => {
        // Intentar diferentes estructuras de respuesta
        let marcasData = [];
        if (response.datos) {
          if (response.datos.datos) {
            marcasData = response.datos.datos;
          } else if (response.datos.marcas) {
            marcasData = response.datos.marcas;
          } else if (Array.isArray(response.datos)) {
            marcasData = response.datos;
          }
        }
        this.marcas = marcasData;
        console.log('Marcas cargadas:', this.marcas);
      },
      error: (error: any) => {
        console.error('Error al cargar marcas:', error);
        this.marcas = [];
      }
    });

    // Cargar productos
    this.productoService.obtenerProductos(1, 100).subscribe({
      next: (response: any) => {
        this.productos = response.datos?.productos || [];
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  establecerFechasPorDefecto() {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    // Establecer fechas por defecto en formato YYYY-MM-DD
    this.filtros.desde = hace30Dias.toISOString().split('T')[0];
    this.filtros.hasta = hoy.toISOString().split('T')[0];
    this.filtros.fecha = hoy.toISOString().split('T')[0];

    // Establecer límites de fecha (opcional)
    const hace1Año = new Date();
    hace1Año.setFullYear(hoy.getFullYear() - 1);
    this.fechaMinima = hace1Año.toISOString().split('T')[0];
    this.fechaMaxima = hoy.toISOString().split('T')[0];
  }

  seleccionarReporte(reporte: any) {
    this.reporteSeleccionado = reporte;
    this.limpiarFiltros();
    this.establecerFechasPorDefecto();
    this.configurarColumnas(reporte.endpoint);
  }

  configurarColumnas(endpoint: string) {
    // Configurar columnas según el tipo de reporte
    switch (endpoint) {
      case 'ventas/por-periodo':
        this.columnas = [
          { key: 'id_venta', label: 'ID Venta' },
          { key: 'fecha', label: 'Fecha' },
          { key: 'cliente_nombre', label: 'Cliente' },
          { key: 'usuario_nombre', label: 'Usuario' },
          { key: 'total', label: 'Total' },
          { key: 'estado', label: 'Estado' }
        ];
        break;
      case 'inventario/stock-actual':
        this.columnas = [
          { key: 'nombre', label: 'Producto' },
          { key: 'sku', label: 'SKU' },
          { key: 'categoria_nombre', label: 'Categoría' },
          { key: 'marca_nombre', label: 'Marca' },
          { key: 'stock', label: 'Stock' },
          { key: 'precio_unitario', label: 'Precio' }
        ];
        break;
      case 'caja/resumen-diario':
        this.columnas = [
          { key: 'fecha', label: 'Fecha' },
          { key: 'total_ventas', label: 'Total Ventas' },
          { key: 'total_ingresos', label: 'Total Ingresos' },
          { key: 'ticket_promedio', label: 'Valor Promedio de Venta' }
        ];
        break;
      case 'pedidos/por-estado':
        this.columnas = [
          { key: 'id_pedido', label: 'ID Pedido' },
          { key: 'fecha_pedido', label: 'Fecha Pedido' },
          { key: 'proveedor_nombre', label: 'Proveedor' },
          { key: 'estado', label: 'Estado' },
          { key: 'observacion', label: 'Observación' }
        ];
        break;
      case 'productos/por-categoria':
        this.columnas = [
          { key: 'categoria_nombre', label: 'Categoría' },
          { key: 'total_productos', label: 'Total Productos' },
          { key: 'precio_promedio', label: 'Precio Promedio' },
          { key: 'total_stock', label: 'Stock Total' }
        ];
        break;
      case 'clientes/mas-frecuentes':
        this.columnas = [
          { key: 'cliente_nombre', label: 'Cliente' },
          { key: 'total_compras', label: 'Total Compras' },
          { key: 'ultima_compra', label: 'Última Compra' }
        ];
        break;
      case 'financieros/ingresos-por-periodo':
        this.columnas = [
          { key: 'fecha', label: 'Fecha' },
          { key: 'total_ventas', label: 'Total Ventas' },
          { key: 'total_ingresos', label: 'Total Ingresos' },
          { key: 'ticket_promedio', label: 'Valor Promedio de Venta' }
        ];
        break;
      default:
        this.columnas = [];
    }

    this.columnasMostradas = this.columnas.map(col => col.key);
  }

  generarReporte() {
    if (!this.reporteSeleccionado) {
      this.snackBar.open('Por favor selecciona un reporte', 'Cerrar', { duration: 3000 });
      return;
    }

    // Validar filtros requeridos según el tipo de reporte
    if (this.reporteSeleccionado.filtros.includes('desde') && !this.filtros.desde) {
      this.snackBar.open('Por favor selecciona una fecha de inicio', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.reporteSeleccionado.filtros.includes('hasta') && !this.filtros.hasta) {
      this.snackBar.open('Por favor selecciona una fecha de fin', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.reporteSeleccionado.filtros.includes('fecha') && !this.filtros.fecha) {
      this.snackBar.open('Por favor selecciona una fecha', 'Cerrar', { duration: 3000 });
      return;
    }

    this.cargando = true;
    this.datos = [];

    // Llamar al método correspondiente según el endpoint
    let observable: any;

    switch (this.reporteSeleccionado.endpoint) {
      case 'ventas/por-periodo':
        observable = this.reporteService.obtenerVentasPorPeriodo(this.filtros);
        break;
      case 'inventario/stock-actual':
        observable = this.reporteService.obtenerStockActual(this.filtros);
        break;
      case 'caja/resumen-diario':
        observable = this.reporteService.obtenerResumenDiarioCaja(this.filtros.fecha || '');
        break;
      case 'pedidos/por-estado':
        observable = this.reporteService.obtenerPedidosPorEstado(this.filtros);
        break;
      case 'productos/por-categoria':
        observable = this.reporteService.obtenerProductosPorCategoria(this.filtros.activo);
        break;
      case 'clientes/mas-frecuentes':
        observable = this.reporteService.obtenerClientesMasFrecuentes(
          this.filtros.desde || '',
          this.filtros.hasta || '',
          this.filtros.limite || 10
        );
        break;
      case 'financieros/ingresos-por-periodo':
        observable = this.reporteService.obtenerIngresosPorPeriodo(
          this.filtros.desde || '',
          this.filtros.hasta || ''
        );
        break;
      case 'pedidos/analisis-proveedores':
        observable = this.reporteService.obtenerAnalisisProveedores(
          this.filtros.desde || '',
          this.filtros.hasta || ''
        );
        break;
      case 'dashboard-ejecutivo':
        observable = this.reporteService.obtenerDashboardEjecutivo(
          this.filtros.desde || '',
          this.filtros.hasta || ''
        );
        break;
      default:
        this.snackBar.open('Reporte no implementado', 'Cerrar', { duration: 3000 });
        this.cargando = false;
        return;
    }

    observable.subscribe({
      next: (response: RespuestaReporte) => {
        this.cargando = false;

        if (response.ok) {
          // Extraer datos según el tipo de reporte con mejor manejo
          let datosExtraidos = [];

          if (response.datos) {
            // Intentar diferentes estructuras de respuesta
            if (response.datos.ventas) {
              datosExtraidos = Array.isArray(response.datos.ventas) ? response.datos.ventas : [response.datos.ventas];
            } else if (response.datos.productos) {
              datosExtraidos = Array.isArray(response.datos.productos) ? response.datos.productos : [response.datos.productos];
            } else if (response.datos.resumen) {
              datosExtraidos = [response.datos.resumen];
            } else if (response.datos.pedidos) {
              datosExtraidos = Array.isArray(response.datos.pedidos) ? response.datos.pedidos : [response.datos.pedidos];
            } else if (response.datos.productos_por_categoria) {
              datosExtraidos = Array.isArray(response.datos.productos_por_categoria) ? response.datos.productos_por_categoria : [response.datos.productos_por_categoria];
            } else if (response.datos.clientes_mas_frecuentes) {
              datosExtraidos = Array.isArray(response.datos.clientes_mas_frecuentes) ? response.datos.clientes_mas_frecuentes : [response.datos.clientes_mas_frecuentes];
            } else if (response.datos.ingresos) {
              console.log('Datos de ingresos recibidos:', response.datos.ingresos);
              datosExtraidos = Array.isArray(response.datos.ingresos) ? response.datos.ingresos : [response.datos.ingresos];
            } else if (response.datos.proveedores) {
              datosExtraidos = Array.isArray(response.datos.proveedores) ? response.datos.proveedores : [response.datos.proveedores];
            } else if (Array.isArray(response.datos)) {
              datosExtraidos = response.datos;
            } else {
              // Para dashboard ejecutivo u otros casos
              datosExtraidos = [response.datos];
            }
          }

          this.datos = datosExtraidos;
          this.totalRegistros = this.datos.length;
          this.paginaActual = 0; // Resetear a la primera página cuando se genera un nuevo reporte
          console.log('Datos finales asignados:', this.datos);
          console.log('Columnas configuradas:', this.columnas);

          if (this.datos.length > 0) {
            this.snackBar.open(`Reporte generado exitosamente: ${this.totalRegistros} registros`, 'Cerrar', { duration: 3000 });
          } else {
            this.snackBar.open('No se encontraron datos para los filtros seleccionados', 'Cerrar', { duration: 3000 });
          }
        } else {
          this.snackBar.open('Error al generar el reporte: ' + (response.mensaje || 'Error desconocido'), 'Cerrar', { duration: 5000 });
        }
      },
      error: (error: any) => {
        this.cargando = false;
        console.error('Error al generar reporte:', error);

        let mensajeError = 'Error al generar el reporte';
        if (error.error?.mensaje) {
          mensajeError = error.error.mensaje;
        } else if (error.message) {
          mensajeError = error.message;
        }

        this.snackBar.open(mensajeError, 'Cerrar', { duration: 5000 });
      }
    });
  }

  onReportePageChange(event: PageEvent): void {
    this.paginaActual = event.pageIndex;
    this.tamanioPagina = event.pageSize;
  }

  limpiarFiltros() {
    this.filtros = {
      desde: '',
      hasta: '',
      estado: '',
      usuario_id: undefined,
      cliente_id: undefined,
      proveedor_id: undefined,
      categoria_id: undefined,
      marca_id: undefined,
      tipo: '',
      producto_id: undefined,
      limite: 10,
      dias: 30,
      stock_bajo: false,
      activo: true
    };
    this.establecerFechasPorDefecto();
    this.limpiarProveedor();
    this.limpiarUsuario();
    this.limpiarCliente();
  }

  // Métodos para manejar cambios de fecha
  onFechaDesdeChange(event: any) {
    const valor = event.target.value;
    if (valor) {
      this.filtros.desde = valor;
    }
  }

  onFechaHastaChange(event: any) {
    const valor = event.target.value;
    if (valor) {
      this.filtros.hasta = valor;
    }
  }

  onFechaEspecificaChange(event: any) {
    const valor = event.target.value;
    if (valor) {
      this.filtros.fecha = valor;
    }
  }


  // Métodos para dropdown de proveedores
  filtrarProveedores(event: any) {
    const valor = event.target.value.toLowerCase();
    if (valor) {
      this.proveedoresFiltrados = this.proveedores.filter(proveedor =>
        proveedor.nombre.toLowerCase().includes(valor) ||
        proveedor.apellido.toLowerCase().includes(valor) ||
        proveedor.empresa.toLowerCase().includes(valor)
      );
    } else {
      this.proveedoresFiltrados = [...this.proveedores];
    }
    this.mostrarDropdownProveedores = true;
  }

  seleccionarProveedor(proveedor: any) {
    this.proveedorSeleccionado = proveedor;
    this.filtros.proveedor_id = proveedor ? proveedor.id : null;

    if (proveedor) {
      this.busquedaProveedor = `${proveedor.nombre} ${proveedor.apellido} - ${proveedor.empresa}`;
    } else {
      this.busquedaProveedor = 'Todos los proveedores';
    }

    this.mostrarDropdownProveedores = false;
  }

  ocultarDropdownProveedores() {
    // Delay para permitir el click en las opciones
    setTimeout(() => {
      this.mostrarDropdownProveedores = false;
    }, 150);
  }

  limpiarProveedor() {
    this.busquedaProveedor = '';
    this.proveedorSeleccionado = null;
    this.proveedoresFiltrados = [...this.proveedores];
    this.mostrarDropdownProveedores = false;
  }

  // Métodos para dropdown de usuarios
  filtrarUsuarios(event: any) {
    const valor = event.target.value.toLowerCase();
    if (valor) {
      this.usuariosFiltrados = this.usuarios.filter(usuario =>
        usuario.nombre.toLowerCase().includes(valor) ||
        usuario.apellido.toLowerCase().includes(valor) ||
        usuario.correo.toLowerCase().includes(valor)
      );
    } else {
      this.usuariosFiltrados = [...this.usuarios];
    }
    this.mostrarDropdownUsuarios = true;
  }

  seleccionarUsuario(usuario: any) {
    this.usuarioSeleccionado = usuario;
    this.filtros.usuario_id = usuario ? usuario.id_usuario : null;

    if (usuario) {
      this.busquedaUsuario = `${usuario.nombre} ${usuario.apellido} - ${usuario.correo}`;
    } else {
      this.busquedaUsuario = 'Todos los usuarios';
    }

    this.mostrarDropdownUsuarios = false;
  }

  ocultarDropdownUsuarios() {
    // Delay para permitir el click en las opciones
    setTimeout(() => {
      this.mostrarDropdownUsuarios = false;
    }, 150);
  }

  limpiarUsuario() {
    this.busquedaUsuario = '';
    this.usuarioSeleccionado = null;
    this.usuariosFiltrados = [...this.usuarios];
    this.mostrarDropdownUsuarios = false;
    this.filtros.usuario_id = undefined;
  }

  // Métodos para dropdown de clientes
  filtrarClientes(event: any) {
    const valor = event.target.value.toLowerCase();
    if (valor) {
      this.clientesFiltrados = this.clientes.filter(cliente =>
        cliente.nombres.toLowerCase().includes(valor) ||
        (cliente.apellidos && cliente.apellidos.toLowerCase().includes(valor)) ||
        (cliente.nit && cliente.nit.toLowerCase().includes(valor)) ||
        (cliente.email && cliente.email.toLowerCase().includes(valor))
      );
    } else {
      this.clientesFiltrados = [...this.clientes];
    }
    this.mostrarDropdownClientes = true;
  }

  seleccionarCliente(cliente: any) {
    this.clienteSeleccionado = cliente;
    this.filtros.cliente_id = cliente ? cliente.id_cliente : null;

    if (cliente) {
      this.busquedaCliente = `${cliente.nombres} ${cliente.apellidos || ''} - ${cliente.nit || 'Sin NIT'}`;
    } else {
      this.busquedaCliente = 'Todos los clientes';
    }

    this.mostrarDropdownClientes = false;
  }

  ocultarDropdownClientes() {
    // Delay para permitir el click en las opciones
    setTimeout(() => {
      this.mostrarDropdownClientes = false;
    }, 150);
  }

  limpiarCliente() {
    this.busquedaCliente = '';
    this.clienteSeleccionado = null;
    this.clientesFiltrados = [...this.clientes];
    this.mostrarDropdownClientes = false;
    this.filtros.cliente_id = undefined;
  }


  exportarAExcel() {
    if (this.datos.length === 0) {
      this.snackBar.open('No hay datos para exportar', 'Cerrar', { duration: 3000 });
      return;
    }

    try {
      // Preparar los datos para exportar
      const datosParaExportar = this.datos.map(item => {
        const fila: any = {};
        this.columnas.forEach(columna => {
          const valor = item[columna.key];
          if (valor !== null && valor !== undefined) {
            // Formatear valores según el tipo
            if (columna.key.includes('total') || columna.key.includes('precio') || columna.key.includes('monto')) {
              fila[columna.label] = parseFloat(valor) || 0;
            } else if (columna.key.includes('fecha')) {
              fila[columna.label] = new Date(valor).toLocaleDateString('es-GT');
            } else if (columna.key.includes('stock') || columna.key.includes('cantidad')) {
              fila[columna.label] = parseInt(valor) || 0;
            } else {
              fila[columna.label] = valor.toString();
            }
          } else {
            fila[columna.label] = '-';
          }
        });
        return fila;
      });

      // Crear el libro de trabajo
      const ws = XLSX.utils.json_to_sheet(datosParaExportar);

      // Configurar el ancho de las columnas
      const colWidths = this.columnas.map(columna => ({
        wch: Math.max(columna.label.length, 15)
      }));
      ws['!cols'] = colWidths;

      // Crear el libro de trabajo
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

      // Generar el nombre del archivo
      const fecha = new Date().toISOString().split('T')[0];
      const nombreReporte = this.reporteSeleccionado?.titulo?.replace(/\s+/g, '_') || 'Reporte';
      const nombreArchivo = `${nombreReporte}_${fecha}.xlsx`;

      // Descargar el archivo
      XLSX.writeFile(wb, nombreArchivo);

      this.snackBar.open('Reporte exportado exitosamente', 'Cerrar', { duration: 3000 });
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      this.snackBar.open('Error al exportar el reporte', 'Cerrar', { duration: 3000 });
    }
  }

  obtenerReportesPorTab(tabIndex: number) {
    switch (tabIndex) {
      case 0:
        return this.reportesBasicos;
      case 1:
        return this.reportesOperativos;
      case 2:
        return this.reportesAvanzados;
      default:
        return [];
    }
  }

  formatearValor(valor: any, tipo: string = 'texto'): string {
    if (valor === null || valor === undefined) {
      return '-';
    }

    switch (tipo) {
      case 'moneda':
        return new Intl.NumberFormat('es-GT', {
          style: 'currency',
          currency: 'GTQ'
        }).format(valor);
      case 'numero':
        return new Intl.NumberFormat('es-GT').format(valor);
      case 'fecha':
        return new Date(valor).toLocaleDateString('es-GT');
      case 'porcentaje':
        return `${valor}%`;
      default:
        return valor.toString();
    }
  }
}
