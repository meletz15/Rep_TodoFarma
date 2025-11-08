import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CargaService, PreviewResponse, ConfirmarCargaResponse } from '../../services/carga.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog.component';
import { CategoriaService } from '../../services/categoria.service';
import { MarcaService, Marca } from '../../services/marca.service';
import { PresentacionService } from '../../services/presentacion.service';
import { UnidadMedidaService } from '../../services/unidad-medida.service';
import { Categoria } from '../../models/categoria.model';
import { Presentacion } from '../../models/presentacion.model';
import { UnidadMedida } from '../../models/unidad-medida.model';

interface TipoCarga {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
}

@Component({
  selector: 'app-carga',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './carga.component.html',
  styleUrls: ['./carga.component.css']
})
export class CargaComponent implements OnInit {
  tiposCarga: TipoCarga[] = [
    { id: 'proveedores', nombre: 'Proveedores', descripcion: 'Cargar proveedores desde Excel', icono: 'business' },
    { id: 'categorias', nombre: 'Categorías', descripcion: 'Cargar categorías desde Excel', icono: 'category' },
    { id: 'marcas', nombre: 'Marcas', descripcion: 'Cargar marcas desde Excel', icono: 'label' },
    { id: 'presentaciones', nombre: 'Presentaciones', descripcion: 'Cargar presentaciones desde Excel', icono: 'inventory_2' },
    { id: 'unidades-medida', nombre: 'Unidades de Medida', descripcion: 'Cargar unidades de medida desde Excel', icono: 'straighten' },
    { id: 'productos', nombre: 'Productos', descripcion: 'Cargar productos desde Excel', icono: 'inventory' }
  ];

  tabSeleccionado = 0;
  tipoCargaActual: string = 'proveedores';
  
  archivoSeleccionado: File | null = null;
  previewData: any = null;
  todosLosDatos: any[] = []; // Guardar todos los datos válidos
  cargando = false;
  procesando = false;

  previewDataSource = new MatTableDataSource<any>([]);
  previewDisplayedColumns: string[] = [];
  erroresDataSource = new MatTableDataSource<any>([]);
  erroresDisplayedColumns = ['fila', 'error', 'datos'];

  // Catálogos
  categorias: Categoria[] = [];
  marcas: Marca[] = [];
  presentaciones: Presentacion[] = [];
  unidadesMedida: UnidadMedida[] = [];
  cargandoCatalogos = false;

  constructor(
    private cargaService: CargaService,
    private categoriaService: CategoriaService,
    private marcaService: MarcaService,
    private presentacionService: PresentacionService,
    private unidadMedidaService: UnidadMedidaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.tipoCargaActual = this.tiposCarga[0].id;
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.cargandoCatalogos = true;
    
    // Cargar todos los catálogos en paralelo
    Promise.all([
      this.categoriaService.obtenerCategoriasActivas().toPromise(),
      this.marcaService.obtenerMarcasActivas().toPromise(),
      this.presentacionService.obtenerActivas().toPromise(),
      this.unidadMedidaService.obtenerActivas().toPromise()
    ]).then(([categoriasRes, marcasRes, presentacionesRes, unidadesRes]) => {
      if (categoriasRes?.ok && categoriasRes.datos) {
        this.categorias = categoriasRes.datos;
      }
      if (marcasRes?.exito && marcasRes.datos) {
        // Convertir MarcaActiva[] a Marca[] agregando campos faltantes
        this.marcas = marcasRes.datos.map(m => ({
          id_marca: m.id_marca,
          nombre: m.nombre,
          descripcion: '',
          activo: true,
          created_at: '',
          updated_at: ''
        }));
      }
      if (presentacionesRes?.ok && presentacionesRes.datos) {
        this.presentaciones = presentacionesRes.datos;
      }
      if (unidadesRes?.ok && unidadesRes.datos) {
        this.unidadesMedida = unidadesRes.datos;
      }
      this.cargandoCatalogos = false;
    }).catch(error => {
      console.error('Error al cargar catálogos:', error);
      this.cargandoCatalogos = false;
    });
  }

  onTabChange(index: number): void {
    // Si el índice es 0, es la pestaña de Catálogos, no hay tipo de carga
    if (index === 0) {
      this.tipoCargaActual = '';
      return;
    }
    // Ajustar el índice porque la primera pestaña es Catálogos
    const tipoIndex = index - 1;
    if (tipoIndex >= 0 && tipoIndex < this.tiposCarga.length) {
      this.tipoCargaActual = this.tiposCarga[tipoIndex].id;
      this.limpiarDatos();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'xlsx' && ext !== 'xls') {
        this.snackBar.open('Solo se permiten archivos Excel (.xlsx, .xls)', 'Cerrar', { duration: 3000 });
        return;
      }
      this.archivoSeleccionado = file;
    }
  }

  descargarPlantilla(): void {
    this.cargando = true;
    this.cargaService.descargarPlantilla(this.tipoCargaActual)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `plantilla-${this.tipoCargaActual}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.cargando = false;
          this.snackBar.open('Plantilla descargada correctamente', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error al descargar plantilla:', error);
          this.snackBar.open('Error al descargar plantilla', 'Cerrar', { duration: 3000 });
          this.cargando = false;
        }
      });
  }

  procesarArchivo(): void {
    if (!this.archivoSeleccionado) {
      this.snackBar.open('Por favor selecciona un archivo', 'Cerrar', { duration: 3000 });
      return;
    }

    this.procesando = true;
    this.cargaService.procesarArchivo(this.archivoSeleccionado, this.tipoCargaActual)
      .subscribe({
        next: (response: PreviewResponse) => {
          this.procesando = false;
          if (response.ok && response.datos) {
            this.previewData = response.datos;
            // Guardar todos los datos válidos, no solo el preview
            this.todosLosDatos = response.datos.todosLosDatos || response.datos.preview || [];
            
            // Configurar columnas de preview según el tipo
            if (response.datos.preview.length > 0) {
              this.previewDisplayedColumns = Object.keys(response.datos.preview[0]);
            }
            
            this.previewDataSource.data = response.datos.preview;
            this.erroresDataSource.data = response.datos.errores;
            
            if (response.datos.filasConError > 0) {
              this.snackBar.open(
                `Archivo procesado: ${response.datos.filasValidas} válidas, ${response.datos.filasConError} con errores`,
                'Cerrar',
                { duration: 5000 }
              );
            } else {
              this.snackBar.open(
                `Archivo procesado correctamente: ${response.datos.filasValidas} filas válidas`,
                'Cerrar',
                { duration: 3000 }
              );
            }
          }
        },
        error: (error) => {
          this.procesando = false;
          console.error('Error al procesar archivo:', error);
          const mensaje = error.error?.mensaje || 'Error al procesar archivo';
          this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
        }
      });
  }

  confirmarCarga(): void {
    if (!this.previewData || this.previewData.filasValidas === 0) {
      this.snackBar.open('No hay datos válidos para cargar', 'Cerrar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Confirmar Carga',
        mensaje: `¿Estás seguro de que deseas cargar ${this.previewData.filasValidas} registros al sistema?`,
        confirmarTexto: 'Confirmar',
        cancelarTexto: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargando = true;
        
        // Usar todos los datos válidos procesados
        this.cargaService.confirmarCarga(this.tipoCargaActual, this.todosLosDatos)
          .subscribe({
            next: (response: ConfirmarCargaResponse) => {
              this.cargando = false;
              if (response.ok) {
                const mensaje = `Carga completada: ${response.datos.creados} creados, ${response.datos.actualizados} actualizados`;
                this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
                this.limpiarDatos();
              }
            },
            error: (error) => {
              this.cargando = false;
              console.error('Error al confirmar carga:', error);
              const mensaje = error.error?.mensaje || 'Error al confirmar carga';
              this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
            }
          });
      }
    });
  }

  limpiarDatos(): void {
    this.archivoSeleccionado = null;
    this.previewData = null;
    this.todosLosDatos = [];
    this.previewDataSource.data = [];
    this.erroresDataSource.data = [];
    this.previewDisplayedColumns = [];
    
    // Limpiar input file
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  obtenerNombreArchivo(): string {
    return this.archivoSeleccionado ? this.archivoSeleccionado.name : 'Ningún archivo seleccionado';
  }

  formatearObjeto(obj: any): string {
    if (!obj) return '-';
    return JSON.stringify(obj, null, 2);
  }

  formatearActivo(valor: any): string {
    if (valor === true || valor === 'true' || valor === 1 || valor === '1') {
      return 'Sí';
    }
    if (valor === false || valor === 'false' || valor === 0 || valor === '0') {
      return 'No';
    }
    // Intentar convertir "Sí"/"No" a texto
    const valorStr = String(valor).trim().toLowerCase();
    if (['sí', 'si', 's', 'yes', 'y'].includes(valorStr)) {
      return 'Sí';
    }
    if (['no', 'n', 'not'].includes(valorStr)) {
      return 'No';
    }
    return String(valor);
  }
}

