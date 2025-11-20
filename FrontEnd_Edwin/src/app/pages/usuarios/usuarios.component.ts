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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../../models/usuario.model';
import { ConfirmDialogComponent } from '../../components/confirm-dialog.component';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-usuarios',
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
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['nombre', 'apellido', 'correo', 'rol_nombre', 'estado', 'fecha_registro', 'acciones'];
  dataSource = new MatTableDataSource<Usuario>();
  
  loading = false;
  totalUsuarios = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Filtros
  filtros = {
    rol_id: '',
    estado: '',
    busqueda: ''
  };

  // Formulario para crear/editar usuario
  usuarioForm: FormGroup;
  editMode = false;
  selectedUsuario: Usuario | null = null;
  mostrarDialogo = false;

  // Roles disponibles (simulado - en un caso real vendría de la API)
  roles = [
    { id: 1, nombre: 'ADMIN' },
    { id: 2, nombre: 'USUARIO' },
    { id: 3, nombre: 'VENDEDOR' }
  ];

  constructor(
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      rol_id: ['', Validators.required],
      estado: ['ACTIVO']
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  ngAfterViewInit() {
    // NO conectar el paginator al DataSource para paginación del servidor
    // this.dataSource.paginator = this.paginator; // REMOVIDO - usa paginación del servidor
    this.dataSource.sort = this.sort;
  }

  cargarUsuarios(): void {
    this.loading = true;
    
    this.usuarioService.obtenerUsuarios(this.currentPage, this.pageSize, this.filtros)
      .subscribe({
        next: (response) => {
          if (response.ok && response.datos) {
            const usuarios = response.datos.datos || [];
            let total = response.datos.paginacion?.total || 0;
            
            // WORKAROUND: Si el backend devuelve total=0 pero hay datos
            if (total === 0 && usuarios.length > 0) {
              if (usuarios.length === this.pageSize) {
                total = this.currentPage * this.pageSize + 1;
              } else {
                total = (this.currentPage - 1) * this.pageSize + usuarios.length;
              }
            }
            
            this.dataSource.data = usuarios;
            this.totalUsuarios = total;
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Error al cargar usuarios', 'Cerrar', {
            duration: 3000
          });
        }
      });
  }

  aplicarFiltros(): void {
    this.currentPage = 1;
    this.cargarUsuarios();
  }

  limpiarFiltros(): void {
    this.filtros = {
      rol_id: '',
      estado: '',
      busqueda: ''
    };
    this.aplicarFiltros();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.cargarUsuarios();
  }

  abrirGestionRoles(): void {
    if (this.router) {
      this.router.navigate(['/gestion-roles']);
    }
  }

  abrirDialogoUsuario(usuario?: Usuario): void {
    this.editMode = !!usuario;
    this.selectedUsuario = usuario || null;
    this.mostrarDialogo = true;
    
    if (usuario) {
      // Modo edición
      this.usuarioForm.patchValue({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol_id: usuario.rol_id,
        estado: usuario.estado,
        contrasena: '' // No mostrar contraseña actual
      });
      this.usuarioForm.get('contrasena')?.clearValidators();
    } else {
      // Modo creación
      this.usuarioForm.reset({
        estado: 'ACTIVO'
      });
      this.usuarioForm.get('contrasena')?.setValidators([Validators.required, Validators.minLength(8)]);
    }
    
    this.usuarioForm.get('contrasena')?.updateValueAndValidity();
  }

  guardarUsuario(): void {
    if (this.usuarioForm.valid) {
      const formData = this.usuarioForm.value;
      
      if (this.editMode && this.selectedUsuario) {
        // Actualizar usuario
        const updateData: UsuarioUpdate = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: formData.correo,
          rol_id: formData.rol_id,
          estado: formData.estado
        };
        
        // Solo incluir contraseña si se proporcionó una nueva
        if (formData.contrasena) {
          updateData.contrasena = formData.contrasena;
        }
        
        this.usuarioService.actualizarUsuario(this.selectedUsuario.id_usuario, updateData)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Usuario actualizado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarUsuarios();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al actualizar usuario', 'Cerrar', {
                duration: 3000
              });
            }
          });
      } else {
        // Crear usuario
        const newUsuario: UsuarioCreate = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: formData.correo,
          contrasena: formData.contrasena,
          rol_id: formData.rol_id,
          estado: formData.estado
        };
        
        this.usuarioService.crearUsuario(newUsuario)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Usuario creado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarUsuarios();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al crear usuario', 'Cerrar', {
                duration: 3000
              });
            }
          });
      }
    }
  }

  eliminarUsuario(usuario: Usuario): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Desactivar Usuario',
        mensaje: `¿Está seguro de que desea desactivar al usuario ${usuario.nombre} ${usuario.apellido}? El usuario quedará inactivo pero no se eliminará del sistema.`,
        confirmarTexto: 'Desactivar',
        cancelarTexto: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.usuarioService.eliminarUsuario(usuario.id_usuario)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Usuario desactivado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarUsuarios();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al desactivar usuario', 'Cerrar', {
                duration: 3000
              });
            }
          });
      }
    });
  }

  cerrarDialogo(): void {
    this.editMode = false;
    this.selectedUsuario = null;
    this.usuarioForm.reset();
    this.mostrarDialogo = false;
  }

  getRolNombre(rolId: number): string {
    const rol = this.roles.find(r => r.id === rolId);
    return rol ? rol.nombre : 'N/A';
  }

  getEstadoClass(estado: string): string {
    return estado === 'ACTIVO' ? 'estado-activo' : 'estado-inactivo';
  }

  exportarAExcel(): void {
    try {
      // Preparar los datos para exportar
      const datosParaExportar = this.dataSource.data.map(usuario => ({
        'Nombre': usuario.nombre,
        'Apellido': usuario.apellido,
        'Correo Electrónico': usuario.correo,
        'Rol': this.getRolNombre(usuario.rol_id),
        'Estado': usuario.estado,
        'Fecha de Registro': new Date(usuario.fecha_registro).toLocaleDateString('es-GT'),
        'ID Usuario': usuario.id_usuario
      }));

      // Crear el libro de trabajo
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(datosParaExportar);

      // Ajustar el ancho de las columnas
      const columnWidths = [
        { wch: 15 }, // Nombre
        { wch: 15 }, // Apellido
        { wch: 25 }, // Correo
        { wch: 12 }, // Rol
        { wch: 10 }, // Estado
        { wch: 15 }, // Fecha
        { wch: 12 }  // ID
      ];
      worksheet['!cols'] = columnWidths;

      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

      // Generar el archivo
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Crear nombre del archivo con fecha
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Usuarios_TodoFarma_${fecha}.xlsx`;

      // Descargar el archivo
      saveAs(blob, nombreArchivo);

      // Mostrar mensaje de éxito
      this.snackBar.open(`Se exportaron ${datosParaExportar.length} usuarios a Excel`, 'Cerrar', {
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
