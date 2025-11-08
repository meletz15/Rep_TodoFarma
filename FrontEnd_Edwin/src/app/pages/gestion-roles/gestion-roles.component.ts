import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { RolService } from '../../services/rol.service';
import { Rol, RolCreate, RolUpdate } from '../../models/rol.model';
import { ConfirmDialogComponent } from '../../components/confirm-dialog.component';
import { AuthService } from '../../services/auth.service';

// Opciones del menú disponibles
const OPCIONES_MENU = [
  { key: 'ventas', label: 'Ventas', icon: 'point_of_sale' },
  { key: 'productos', label: 'Productos', icon: 'inventory' },
  { key: 'caja', label: 'Caja', icon: 'account_balance_wallet' },
  { key: 'clientes', label: 'Clientes', icon: 'people' },
  { key: 'proveedores', label: 'Gestión de Proveedores', icon: 'business' },
  { key: 'gestion_pedidos', label: 'Gestión Pedido', icon: 'local_shipping' },
  { key: 'inventario', label: 'Inventario', icon: 'assessment' },
  { key: 'reportes', label: 'Reporte', icon: 'analytics' },
  { key: 'usuarios', label: 'Usuario', icon: 'person' },
  { key: 'configuracion', label: 'Configuración', icon: 'settings' },
  { key: 'carga', label: 'Carga', icon: 'upload_file' },
  { key: 'dashboard', label: 'Menú Inicio', icon: 'home' }
];

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './gestion-roles.component.html',
  styleUrls: ['./gestion-roles.component.css']
})
export class GestionRolesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['nombre', 'descripcion', 'activo', 'fecha_creacion', 'acciones'];
  dataSource = new MatTableDataSource<Rol>();
  
  loading = false;
  roles: Rol[] = [];
  
  // Formulario para crear/editar rol
  rolForm: FormGroup;
  editMode = false;
  selectedRol: Rol | null = null;
  mostrarDialogo = false;
  opcionesMenu = OPCIONES_MENU;

  constructor(
    private rolService: RolService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService
  ) {
    // Crear controles de permisos
    const permisosControls: { [key: string]: any } = {};
    this.opcionesMenu.forEach(opcion => {
      permisosControls[opcion.key] = [false];
    });

    // Formulario combinado con rol y permisos
    this.rolForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(255)]],
      activo: [true],
      ...permisosControls
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.loading = true;
    this.rolService.obtenerTodos()
      .subscribe({
        next: (response) => {
          if (response.ok && response.datos) {
            this.roles = response.datos;
            this.dataSource.data = this.roles;
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Error al cargar roles', 'Cerrar', {
            duration: 3000
          });
        }
      });
  }

  abrirDialogoRol(rol?: Rol): void {
    this.editMode = !!rol;
    this.selectedRol = rol || null;

    // Preparar valores del formulario
    const formValues: any = {
      nombre: '',
      descripcion: '',
      activo: true
    };

    // Inicializar todos los permisos en false
    this.opcionesMenu.forEach(opcion => {
      formValues[opcion.key] = false;
    });

    if (rol) {
      // Modo edición
      formValues.nombre = rol.nombre;
      formValues.descripcion = rol.descripcion || '';
      formValues.activo = rol.activo;

      // Cargar permisos
      const permisos = rol.permisos || {};
      this.opcionesMenu.forEach(opcion => {
        formValues[opcion.key] = permisos[opcion.key] === true;
      });
    }

    // Aplicar valores al formulario
    this.rolForm.patchValue(formValues);
    this.mostrarDialogo = true;
  }

  cerrarDialogo(): void {
    this.mostrarDialogo = false;
    this.rolForm.reset();
    this.selectedRol = null;
    this.editMode = false;
  }

  guardarRol(): void {
    if (this.rolForm.invalid) {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    // Extraer permisos del formulario
    const formValue = this.rolForm.value;
    const permisos: { [key: string]: boolean } = {};
    this.opcionesMenu.forEach(opcion => {
      permisos[opcion.key] = formValue[opcion.key] || false;
    });

    // Preparar datos del rol (sin los permisos en el nivel raíz)
    const datosRol = {
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      activo: formValue.activo,
      permisos
    };

    if (this.editMode && this.selectedRol) {
      // Actualizar
      this.rolService.actualizar(this.selectedRol.id_rol, datosRol)
        .subscribe({
          next: (response) => {
            if (response.ok) {
              // Verificar si el usuario actual tiene este rol
              const usuarioActual = this.authService.getCurrentUser();
              if (usuarioActual && usuarioActual.rol === this.selectedRol?.nombre) {
                // Si el usuario actual tiene este rol, recargar su perfil para actualizar permisos
                this.authService.recargarPerfil().subscribe({
                  next: () => {
                    this.snackBar.open('Rol actualizado correctamente. Los permisos del menú se han actualizado.', 'Cerrar', {
                      duration: 4000
                    });
                  },
                  error: () => {
                    this.snackBar.open('Rol actualizado correctamente. Por favor, recarga la página para ver los cambios en el menú.', 'Cerrar', {
                      duration: 4000
                    });
                  }
                });
              } else {
                this.snackBar.open('Rol actualizado correctamente', 'Cerrar', {
                  duration: 3000
                });
              }
              this.cerrarDialogo();
              this.cargarRoles();
            }
          },
          error: (error) => {
            this.snackBar.open(error.error?.mensaje || 'Error al actualizar rol', 'Cerrar', {
              duration: 3000
            });
          }
        });
    } else {
      // Crear
      this.rolService.crear(datosRol)
        .subscribe({
          next: (response) => {
            if (response.ok) {
              this.snackBar.open('Rol creado correctamente', 'Cerrar', {
                duration: 3000
              });
              this.cerrarDialogo();
              this.cargarRoles();
            }
          },
          error: (error) => {
            this.snackBar.open(error.error?.mensaje || 'Error al crear rol', 'Cerrar', {
              duration: 3000
            });
          }
        });
    }
  }

  eliminarRol(rol: Rol): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Eliminar Rol',
        mensaje: `¿Está seguro de que desea eliminar el rol "${rol.nombre}"?`,
        confirmarTexto: 'Eliminar',
        cancelarTexto: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.rolService.eliminar(rol.id_rol)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Rol eliminado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarRoles();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al eliminar rol', 'Cerrar', {
                duration: 3000
              });
            }
          });
      }
    });
  }

  togglePermiso(opcion: string): void {
    const currentValue = this.rolForm.get(opcion)?.value || false;
    this.rolForm.patchValue({ [opcion]: !currentValue });
  }

  seleccionarTodosPermisos(): void {
    const todosSeleccionados = this.opcionesMenu.every(opcion => 
      this.rolForm.get(opcion.key)?.value === true
    );

    const updateValues: any = {};
    this.opcionesMenu.forEach(opcion => {
      updateValues[opcion.key] = !todosSeleccionados;
    });
    this.rolForm.patchValue(updateValues);
  }

  volverAUsuarios(): void {
    this.router.navigate(['/usuarios']);
  }
}

