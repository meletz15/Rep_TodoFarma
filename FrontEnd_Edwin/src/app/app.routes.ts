import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { permissionsGuard } from './guards/permissions.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [permissionsGuard]
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent),
        canActivate: [permissionsGuard]
      },
       {
        path: 'proveedores',
        loadComponent: () => import('./pages/gestion-pedido/proveedores/proveedores.component').then(m => m.ProveedoresComponent),
        canActivate: [permissionsGuard]
      },
      {
        path: 'ventas',
        loadComponent: () => import('./pages/ventas/ventas.component').then(m => m.VentasComponent),
        canActivate: [permissionsGuard]
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/productos/productos.component').then(m => m.ProductosComponent),
        canActivate: [permissionsGuard]
      },
      {
        path: 'caja',
        loadComponent: () => import('./pages/caja/caja.component').then(m => m.CajaComponent),
        canActivate: [permissionsGuard]
      },
      {
        path: 'clientes',
        loadComponent: () => import('./pages/clientes/clientes.component').then(m => m.ClientesComponent),
        canActivate: [permissionsGuard]
      },
      {
        path: 'gestion-pedido',
        loadComponent: () => import('./pages/gestion-pedido/gestion-pedido.component').then(m => m.GestionPedidoComponent),
        canActivate: [permissionsGuard]
      },
      {
        path: 'inventario',
        loadComponent: () => import('./pages/inventario/inventario.component').then(m => m.InventarioComponent),
        canActivate: [permissionsGuard]
      },
      {
        path: 'reporte',
        loadComponent: () => import('./pages/reporte/reporte.component').then(m => m.ReporteComponent),
        canActivate: [permissionsGuard]
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./pages/configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
        canActivate: [permissionsGuard]
      },
      {
        path: 'carga',
        loadComponent: () => import('./pages/carga/carga.component').then(m => m.CargaComponent),
        canActivate: [permissionsGuard]
      },
      {
        path: 'gestion-roles',
        loadComponent: () => import('./pages/gestion-roles/gestion-roles.component').then(m => m.GestionRolesComponent),
        canActivate: [permissionsGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
