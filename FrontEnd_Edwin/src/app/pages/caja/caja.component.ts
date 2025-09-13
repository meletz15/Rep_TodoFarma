import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { CajaService } from '../../services/caja.service';
import { UsuarioService } from '../../services/usuario.service';
import { 
  Caja, 
  CajaCreate, 
  CajaCerrar, 
  CajaEstadisticasGenerales,
  ResumenDia,
  CajaFiltros
} from '../../models/caja.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatChipsModule,
    MatStepperModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './caja.component.html'
})
export class CajaComponent implements OnInit {
  @ViewChild('cajaPaginator') cajaPaginator!: MatPaginator;
  @ViewChild('cajaSort') cajaSort!: MatSort;

  // Variables para cajas
  cajas: Caja[] = [];
  cajasDataSource = new MatTableDataSource<Caja>();
  cajasDisplayedColumns = ['id_caja', 'fecha_apertura', 'usuario_nombre', 'saldo_inicial', 'estado', 'saldo_cierre', 'acciones'];
  cajaForm!: FormGroup;
  cajaCerrarForm!: FormGroup;
  cajaEditando: Caja | null = null;
  cajaModalAbierto = false;
  cajaCerrarModalAbierto = false;
  cajaCargando = false;
  cajaTotal = 0;
  cajaPagina = 1;
  cajaLimite = 10;
  cajaFiltros: CajaFiltros = {
    estado: '',
    usuario_apertura: undefined,
    fecha_desde: '',
    fecha_hasta: ''
  };

  // Variables para caja abierta
  cajaAbierta: Caja | null = null;
  hayCajaAbierta = false;

  // Variables para resumen diario
  resumenDia: ResumenDia[] = [];
  fechaResumen = new Date();

  // Variables para formularios
  usuariosParaDropdown: Usuario[] = [];

  // Variables para estadísticas
  estadisticas: CajaEstadisticasGenerales | null = null;

  // Variables generales
  tabSeleccionado = 0;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private cajaService: CajaService,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    console.log('🚀 Inicializando componente de caja...');
    console.log('🔑 Token de autenticación:', localStorage.getItem('token'));
    console.log('🔍 Método cerrarCaja disponible:', typeof this.cerrarCaja);
    this.cargarCajas();
    this.cargarUsuariosActivos();
    this.cargarEstadisticas();
    this.verificarCajaAbierta();
    this.cargarResumenDia();
  }

  inicializarFormularios(): void {
    // Formulario de apertura de caja
    this.cajaForm = this.fb.group({
      usuario_apertura: ['', [Validators.required]],
      saldo_inicial: [0, [Validators.min(0)]],
      observacion: ['', [Validators.maxLength(300)]]
    });

    // Formulario de cierre de caja
    this.cajaCerrarForm = this.fb.group({
      usuario_cierre: [''],
      observacion: ['', [Validators.maxLength(300)]]
    });
  }

  // Métodos para cajas
  cargarCajas(): void {
    console.log('🔄 Cargando cajas...');
    console.log('📋 Parámetros:', {
      pagina: this.cajaPagina,
      limite: this.cajaLimite,
      filtros: this.cajaFiltros
    });
    this.cajaCargando = true;
    this.cajaService.obtenerCajas(this.cajaPagina, this.cajaLimite, this.cajaFiltros)
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta completa de cajas:', response);
          console.log('📊 Estructura de datos:', response.datos);
          console.log('📊 Datos de cajas:', response.datos?.datos);
          console.log('📊 Paginación:', response.datos?.paginacion);
          
          if (response.datos && response.datos.datos) {
            this.cajas = response.datos.datos;
            this.cajasDataSource.data = this.cajas;
            this.cajaTotal = response.datos.paginacion?.total || this.cajas.length;
            console.log('✅ Cajas cargadas exitosamente:', this.cajas.length);
            console.log('✅ Total de cajas:', this.cajaTotal);
          } else {
            console.warn('⚠️ Estructura de respuesta inesperada:', response);
            this.cajas = [];
            this.cajasDataSource.data = [];
            this.cajaTotal = 0;
          }
          this.cajaCargando = false;
        },
        error: (error) => {
          console.error('❌ Error al cargar cajas:', error);
          console.error('❌ Detalles del error:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          this.snackBar.open(`Error al cargar cajas: ${error.message || 'Error desconocido'}`, 'Cerrar', { duration: 5000 });
          this.cajaCargando = false;
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
    this.cajaService.obtenerEstadisticasCaja()
      .subscribe({
        next: (response) => {
          this.estadisticas = response.datos;
        },
        error: (error) => {
          console.error('Error al cargar estadísticas:', error);
        }
      });
  }

  verificarCajaAbierta(): void {
    console.log('🔍 Verificando si hay caja abierta...');
    this.cajaService.verificarCajaAbierta()
      .subscribe({
        next: (response) => {
          console.log('📋 Respuesta de verificarCajaAbierta:', response);
          this.hayCajaAbierta = response.datos.hay_caja_abierta;
          console.log('📋 hayCajaAbierta:', this.hayCajaAbierta);
          if (this.hayCajaAbierta) {
            console.log('✅ Hay caja abierta, obteniendo detalles...');
            this.obtenerCajaAbierta();
          } else {
            console.log('❌ No hay caja abierta');
          }
        },
        error: (error) => {
          console.error('❌ Error al verificar caja abierta:', error);
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
          console.error('Error al obtener caja abierta:', error);
        }
      });
  }

  cargarResumenDia(): void {
    const fecha = this.fechaResumen.toISOString().split('T')[0];
    this.cajaService.obtenerResumenPorDia(fecha)
      .subscribe({
        next: (response) => {
          this.resumenDia = response.datos;
        },
        error: (error) => {
          console.error('Error al cargar resumen del día:', error);
        }
      });
  }

  // Métodos para apertura de caja
  abrirCaja(): void {
    console.log('🔧 Abriendo modal de caja...');
    this.cajaModalAbierto = true;
    this.cajaForm.reset();
    console.log('📋 Modal abierto:', this.cajaModalAbierto);
  }

  cerrarModalCaja(): void {
    this.cajaModalAbierto = false;
    this.cajaForm.reset();
  }

  guardarCaja(): void {
    console.log('🔧 Intentando abrir caja...');
    console.log('📋 Formulario válido:', this.cajaForm.valid);
    console.log('📋 Valores del formulario:', this.cajaForm.value);
    
    if (this.cajaForm.valid) {
      const cajaData: CajaCreate = {
        usuario_apertura: this.cajaForm.value.usuario_apertura,
        saldo_inicial: this.cajaForm.value.saldo_inicial || 0,
        observacion: this.cajaForm.value.observacion || ''
      };

      console.log('📤 Datos de caja a enviar:', cajaData);

      this.cajaService.abrirCaja(cajaData)
        .subscribe({
          next: (response) => {
            console.log('✅ Caja abierta exitosamente:', response);
            this.snackBar.open('Caja abierta correctamente', 'Cerrar', { duration: 3000 });
            this.cerrarModalCaja();
            this.verificarCajaAbierta();
            this.cargarCajas();
            this.cargarEstadisticas();
          },
          error: (error) => {
            console.error('❌ Error al abrir caja:', error);
            this.snackBar.open('Error al abrir caja', 'Cerrar', { duration: 3000 });
          }
        });
    } else {
      console.log('❌ Formulario inválido');
      this.snackBar.open('Por favor, complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
  }

  // Métodos para cierre de caja
  cerrarCaja(caja: Caja): void {
    console.log('🔒 Intentando cerrar caja:', caja);
    
    if (caja.estado === 'CERRADO') {
      console.log('❌ Caja ya está cerrada');
      this.snackBar.open('Esta caja ya está cerrada', 'Cerrar', { duration: 3000 });
      return;
    }

    console.log('✅ Caja está abierta, mostrando confirmación');
    const confirmacion = confirm(`¿Estás seguro de que quieres cerrar la caja #${caja.id_caja}?`);
    if (!confirmacion) {
      console.log('❌ Usuario canceló el cierre');
      return;
    }

    console.log('✅ Usuario confirmó, preparando datos de cierre');
    // Obtener el ID del usuario actual (puedes ajustar esto según tu sistema de autenticación)
    const usuarioActual = 1; // TODO: Obtener del servicio de autenticación

    const datosCierre: CajaCerrar = {
      usuario_cierre: usuarioActual,
      observacion: `Caja cerrada el ${new Date().toLocaleString('es-GT')}`
    };

    console.log('📤 Enviando petición de cierre:', { idCaja: caja.id_caja, datosCierre });
    
    this.cajaService.cerrarCaja(caja.id_caja, datosCierre).subscribe({
      next: (response) => {
        console.log('✅ Caja cerrada exitosamente:', response);
        this.snackBar.open('Caja cerrada exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarCajas(); // Recargar la lista
      },
      error: (error) => {
        console.error('❌ Error al cerrar caja:', error);
        this.snackBar.open('Error al cerrar la caja', 'Cerrar', { duration: 3000 });
      }
    });
  }

  verDetalles(caja: Caja): void {
    console.log('👁️ Ver detalles de caja:', caja.id_caja);
    // TODO: Implementar modal de detalles
    this.snackBar.open('Funcionalidad de ver detalles pendiente de implementar', 'Cerrar', { duration: 3000 });
  }


  // Métodos auxiliares para formateo
  formatearFecha(fecha: string | Date): string {
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

  formatearPrecio(precio: number | string | null | undefined): string {
    if (precio === null || precio === undefined || precio === '') {
      return 'Q 0.00';
    }
    
    const precioNumero = typeof precio === 'string' ? parseFloat(precio) : Number(precio);
    
    if (isNaN(precioNumero)) {
      return 'Q 0.00';
    }
    
    return `Q ${precioNumero.toFixed(2)}`;
  }

  // Métodos para paginación y acciones
  onCajaPageChange(event: PageEvent): void {
    this.cajaPagina = event.pageIndex + 1;
    this.cajaLimite = event.pageSize;
    this.cargarCajas();
  }

  // Métodos auxiliares
  obtenerColorEstado(estado: string): string {
    switch (estado) {
      case 'ABIERTO': return 'primary';
      case 'CERRADO': return 'accent';
      default: return 'primary';
    }
  }

  calcularIngresos(caja: Caja): number {
    if (caja.estadisticas) {
      return caja.estadisticas.total_ventas_monto;
    }
    return 0;
  }

  calcularSaldoActual(caja: Caja): number {
    if (caja.estadisticas) {
      return caja.estadisticas.saldo_actual;
    }
    return caja.saldo_inicial;
  }
}