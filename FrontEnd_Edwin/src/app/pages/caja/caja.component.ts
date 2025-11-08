import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { ConfirmDialogComponent } from '../../components/confirm-dialog.component';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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

  // Variables para almacenar todas las cajas (sin paginación del servidor)
  todasLasCajas: Caja[] = [];
  cajasFiltradas: Caja[] = [];

  // Métodos para cajas
  cargarCajas(): void {
    this.cajaCargando = true;
    
    // Preparar filtros para el backend (sin fechas, solo estado y usuario)
    const filtrosBackend: CajaFiltros = {};
    
    // Solo incluir estado si tiene valor
    if (this.cajaFiltros.estado && this.cajaFiltros.estado !== '') {
      filtrosBackend.estado = this.cajaFiltros.estado;
    }
    
    // Solo incluir usuario si tiene valor
    if (this.cajaFiltros.usuario_apertura) {
      filtrosBackend.usuario_apertura = this.cajaFiltros.usuario_apertura;
    }
    
    // NO incluir fechas - se filtran en el frontend
    
    // Cargar todas las cajas (el backend requiere paginación, usamos límite máximo de 100)
    // Luego hacemos paginación y filtrado de fechas en el frontend
    this.cajaService.obtenerTodasLasCajas(filtrosBackend)
      .subscribe({
        next: (response) => {
          if (response.datos && response.datos.datos) {
            // Guardar todas las cajas recibidas
            this.todasLasCajas = response.datos.datos || [];
            
            // Aplicar filtros de fecha en el frontend
            this.aplicarFiltrosFrontend();
          } else {
            this.todasLasCajas = [];
            this.aplicarFiltrosFrontend();
          }
          this.cajaCargando = false;
        },
        error: (error) => {
          console.error('Error al cargar cajas:', error);
          this.snackBar.open(`Error al cargar cajas: ${error.error?.mensaje || error.message || 'Error desconocido'}`, 'Cerrar', { duration: 5000 });
          this.cajaCargando = false;
        }
      });
  }

  // Aplicar filtros de fecha en el frontend y paginación
  aplicarFiltrosFrontend(): void {
    let cajasFiltradas = [...this.todasLasCajas];

    // Filtrar por fecha desde
    if (this.cajaFiltros.fecha_desde) {
      const fechaDesdeValor: any = this.cajaFiltros.fecha_desde;
      const fechaDesde = fechaDesdeValor instanceof Date 
        ? fechaDesdeValor 
        : new Date(fechaDesdeValor);
      fechaDesde.setHours(0, 0, 0, 0);
      
      cajasFiltradas = cajasFiltradas.filter(caja => {
        const fechaApertura = new Date(caja.fecha_apertura);
        fechaApertura.setHours(0, 0, 0, 0);
        return fechaApertura >= fechaDesde;
      });
    }

    // Filtrar por fecha hasta
    if (this.cajaFiltros.fecha_hasta) {
      const fechaHastaValor: any = this.cajaFiltros.fecha_hasta;
      const fechaHasta = fechaHastaValor instanceof Date 
        ? fechaHastaValor 
        : new Date(fechaHastaValor);
      fechaHasta.setHours(23, 59, 59, 999);
      
      cajasFiltradas = cajasFiltradas.filter(caja => {
        const fechaApertura = new Date(caja.fecha_apertura);
        return fechaApertura <= fechaHasta;
      });
    }

    // Guardar cajas filtradas
    this.cajasFiltradas = cajasFiltradas;
    
    // Aplicar paginación en el frontend
    this.aplicarPaginacionFrontend();
  }

  // Aplicar paginación en el frontend
  aplicarPaginacionFrontend(): void {
    const total = this.cajasFiltradas.length;
    const inicio = (this.cajaPagina - 1) * this.cajaLimite;
    const fin = inicio + this.cajaLimite;
    
    this.cajas = this.cajasFiltradas.slice(inicio, fin);
    this.cajasDataSource.data = this.cajas;
    this.cajaTotal = total;
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
    this.cajaService.verificarCajaAbierta()
      .subscribe({
        next: (response) => {
          this.hayCajaAbierta = response.datos.hay_caja_abierta;
          if (this.hayCajaAbierta) {
            this.obtenerCajaAbierta();
          }
        },
        error: (error) => {
          console.error('Error al verificar caja abierta:', error);
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
    this.cajaModalAbierto = true;
    this.cajaForm.reset();
  }

  cerrarModalCaja(): void {
    this.cajaModalAbierto = false;
    this.cajaForm.reset();
  }

  guardarCaja(): void {
    if (this.cajaForm.valid) {
      const cajaData: CajaCreate = {
        usuario_apertura: this.cajaForm.value.usuario_apertura,
        saldo_inicial: this.cajaForm.value.saldo_inicial || 0,
        observacion: this.cajaForm.value.observacion || ''
      };

      this.cajaService.abrirCaja(cajaData)
        .subscribe({
          next: (response) => {
            this.snackBar.open('Caja abierta correctamente', 'Cerrar', { duration: 3000 });
            this.cerrarModalCaja();
            this.verificarCajaAbierta();
            this.cargarCajas();
            this.cargarEstadisticas();
          },
          error: (error) => {
            console.error('Error al abrir caja:', error);
            this.snackBar.open('Error al abrir caja', 'Cerrar', { duration: 3000 });
          }
        });
    } else {
      this.snackBar.open('Por favor, complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
  }

  // Métodos para cierre de caja
  cerrarCaja(caja: Caja): void {
    if (caja.estado === 'CERRADO') {
      this.snackBar.open('Esta caja ya está cerrada', 'Cerrar', { duration: 3000 });
      return;
    }
    
    // Mostrar modal de confirmación
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Cerrar Caja',
        mensaje: `¿Estás seguro de que quieres cerrar la caja #${caja.id_caja}?`,
        confirmarTexto: 'Cerrar Caja',
        cancelarTexto: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Obtener el ID del usuario actual (puedes ajustar esto según tu sistema de autenticación)
        const usuarioActual = 1; // TODO: Obtener del servicio de autenticación

        const datosCierre: CajaCerrar = {
          usuario_cierre: usuarioActual,
          observacion: `Caja cerrada el ${new Date().toLocaleString('es-GT')}`
        };
        
        this.cajaService.cerrarCaja(caja.id_caja, datosCierre).subscribe({
          next: (response) => {
            // Convertir saldo_cierre a número si es necesario
            const saldoCierre = response.datos?.saldo_cierre;
            const saldoCierreNumero = saldoCierre !== null && saldoCierre !== undefined 
              ? (typeof saldoCierre === 'string' ? parseFloat(saldoCierre) : Number(saldoCierre))
              : 0;
            const saldoCierreFormateado = !isNaN(saldoCierreNumero) ? saldoCierreNumero.toFixed(2) : '0.00';
            
            // Recargar datos inmediatamente
            this.cargarCajas();
            this.verificarCajaAbierta();
            this.cargarEstadisticas();
            
            // Mostrar modal de éxito
            const successDialog = this.dialog.open(ConfirmDialogComponent, {
              data: {
                titulo: 'Caja cerrada exitosamente',
                mensaje: `La caja #${caja.id_caja} ha sido cerrada correctamente.\nSaldo de cierre: Q${saldoCierreFormateado}`,
                confirmarTexto: 'Aceptar',
                cancelarTexto: '' // Ocultar botón de cancelar
              }
            });
          },
          error: (error) => {
            console.error('Error al cerrar caja:', error);
            this.snackBar.open('Error al cerrar la caja', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  // Variables para modal de detalles
  cajaDetalleModalAbierto = false;
  cajaSeleccionada: Caja | null = null;
  cajaDetalleCargando = false;

  verDetalles(caja: Caja): void {
    this.cajaDetalleCargando = true;
    this.cajaDetalleModalAbierto = true;
    
    // Cargar detalles completos de la caja
    this.cajaService.obtenerCaja(caja.id_caja)
      .subscribe({
        next: (response) => {
          if (response.ok && response.datos) {
            this.cajaSeleccionada = response.datos;
          }
          this.cajaDetalleCargando = false;
        },
        error: (error) => {
          console.error('Error al cargar detalles de caja:', error);
          this.snackBar.open('Error al cargar los detalles de la caja', 'Cerrar', { duration: 3000 });
          this.cajaDetalleCargando = false;
          this.cerrarModalDetalles();
        }
      });
  }

  cerrarModalDetalles(): void {
    this.cajaDetalleModalAbierto = false;
    this.cajaSeleccionada = null;
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
    this.aplicarPaginacionFrontend();
  }

  // Métodos para filtros
  aplicarFiltros(): void {
    this.cajaPagina = 1; // Resetear a la primera página
    
    // Siempre recargar desde el backend (sin fechas) y luego aplicar filtros de fecha en frontend
    // Si hay filtros de estado o usuario, se enviarán al backend
    // Las fechas siempre se filtran en el frontend
    this.cargarCajas();
  }

  limpiarFiltros(): void {
    this.cajaFiltros = {
      estado: '',
      usuario_apertura: undefined,
      fecha_desde: '',
      fecha_hasta: ''
    };
    this.cajaPagina = 1;
    this.cargarCajas(); // Recargar todas las cajas
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