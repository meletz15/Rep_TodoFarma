import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClienteService } from '../../services/cliente.service';
import { Cliente, ClienteCreate, ClienteUpdate } from '../../models/cliente.model';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['nombres', 'apellidos', 'nit', 'email', 'telefono', 'activo', 'created_at', 'acciones'];
  dataSource = new MatTableDataSource<Cliente>();
  
  loading = false;
  totalClientes = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Filtros
  filtros = {
    activo: '', // Por defecto mostrar todos los clientes (activos e inactivos)
    busqueda: ''
  };

  // Formulario para crear/editar cliente
  clienteForm: FormGroup;
  editMode = false;
  selectedCliente: Cliente | null = null;
  mostrarDialogo = false;

  constructor(
    private clienteService: ClienteService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.clienteForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      apellidos: ['', [Validators.minLength(2), Validators.maxLength(120)]],
      nit: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(160)]],
      telefono: ['', [Validators.maxLength(25)]],
      direccion: ['', [Validators.maxLength(200)]],
      observaciones: ['', [Validators.maxLength(300)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarClientes(): void {
    this.loading = true;
    
    this.clienteService.obtenerClientes(this.currentPage, this.pageSize, this.filtros)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.dataSource.data = response.datos.datos;
            this.totalClientes = response.datos.paginacion.total;
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Error al cargar clientes', 'Cerrar', {
            duration: 3000
          });
        }
      });
  }

  aplicarFiltros(): void {
    this.currentPage = 1;
    this.cargarClientes();
  }

  limpiarFiltros(): void {
    this.filtros = {
      activo: '', // Volver a mostrar todos los clientes (activos e inactivos)
      busqueda: ''
    };
    this.aplicarFiltros();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.cargarClientes();
  }

  abrirDialogoCliente(cliente?: Cliente): void {
    this.editMode = !!cliente;
    this.selectedCliente = cliente || null;
    this.mostrarDialogo = true;
    
    if (cliente) {
      // Modo edición
      this.clienteForm.patchValue({
        nombres: cliente.nombres,
        apellidos: cliente.apellidos || '',
        nit: cliente.nit || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        observaciones: cliente.observaciones || '',
        activo: cliente.activo
      });
    } else {
      // Modo creación
      this.clienteForm.reset({
        activo: true
      });
    }
  }

  guardarCliente(): void {
    if (this.clienteForm.valid) {
      const formData = this.clienteForm.value;
      
      if (this.editMode && this.selectedCliente) {
        // Actualizar cliente
        const updateData: ClienteUpdate = {
          nombres: formData.nombres,
          apellidos: formData.apellidos || null,
          nit: formData.nit || null,
          email: formData.email || null,
          telefono: formData.telefono || null,
          direccion: formData.direccion || null,
          observaciones: formData.observaciones || null,
          activo: formData.activo
        };
        
        this.clienteService.actualizarCliente(this.selectedCliente.id_cliente, updateData)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Cliente actualizado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarClientes();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al actualizar cliente', 'Cerrar', {
                duration: 3000
              });
            }
          });
      } else {
        // Crear cliente
        const newCliente: ClienteCreate = {
          nombres: formData.nombres,
          apellidos: formData.apellidos || null,
          nit: formData.nit || null,
          email: formData.email || null,
          telefono: formData.telefono || null,
          direccion: formData.direccion || null,
          observaciones: formData.observaciones || null,
          activo: formData.activo
        };
        
        this.clienteService.crearCliente(newCliente)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Cliente creado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarClientes();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al crear cliente', 'Cerrar', {
                duration: 3000
              });
            }
          });
      }
    }
  }

  eliminarCliente(cliente: Cliente): void {
    if (confirm(`¿Está seguro de que desea eliminar al cliente ${cliente.nombres} ${cliente.apellidos || ''}?`)) {
      this.clienteService.eliminarCliente(cliente.id_cliente)
        .subscribe({
          next: (response) => {
            if (response.ok) {
              this.snackBar.open('Cliente eliminado correctamente', 'Cerrar', {
                duration: 3000
              });
              this.cargarClientes();
            }
          },
          error: (error) => {
            this.snackBar.open(error.error?.mensaje || 'Error al eliminar cliente', 'Cerrar', {
              duration: 3000
            });
          }
        });
    }
  }

  cerrarDialogo(): void {
    this.editMode = false;
    this.selectedCliente = null;
    this.clienteForm.reset();
    this.mostrarDialogo = false;
  }

  getEstadoClass(activo: boolean): string {
    return activo ? 'estado-activo' : 'estado-inactivo';
  }

  exportarAExcel(): void {
    try {
      // Preparar los datos para exportar
      const datosParaExportar = this.dataSource.data.map(cliente => ({
        'Nombres': cliente.nombres,
        'Apellidos': cliente.apellidos || '',
        'NIT': cliente.nit || '',
        'Email': cliente.email || '',
        'Teléfono': cliente.telefono || '',
        'Dirección': cliente.direccion || '',
        'Observaciones': cliente.observaciones || '',
        'Estado': cliente.activo ? 'Activo' : 'Inactivo',
        'Fecha de Registro': new Date(cliente.created_at).toLocaleDateString('es-GT'),
        'ID Cliente': cliente.id_cliente
      }));

      // Crear el libro de trabajo
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(datosParaExportar);

      // Ajustar el ancho de las columnas
      const columnWidths = [
        { wch: 15 }, // Nombres
        { wch: 15 }, // Apellidos
        { wch: 15 }, // NIT
        { wch: 25 }, // Email
        { wch: 15 }, // Teléfono
        { wch: 30 }, // Dirección
        { wch: 30 }, // Observaciones
        { wch: 10 }, // Estado
        { wch: 15 }, // Fecha
        { wch: 12 }  // ID
      ];
      worksheet['!cols'] = columnWidths;

      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');

      // Generar el archivo
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Crear nombre del archivo con fecha
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Clientes_TodoFarma_${fecha}.xlsx`;

      // Descargar el archivo
      saveAs(blob, nombreArchivo);

      // Mostrar mensaje de éxito
      this.snackBar.open(`Se exportaron ${datosParaExportar.length} clientes a Excel`, 'Cerrar', {
        duration: 3000
      });

    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      this.snackBar.open('Error al exportar a Excel', 'Cerrar', {
        duration: 3000
      });
    }
  }
}