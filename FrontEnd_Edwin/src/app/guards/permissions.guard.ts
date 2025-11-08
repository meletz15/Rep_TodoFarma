import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// Mapeo de rutas a claves de permisos
const RUTA_A_PERMISO: { [key: string]: string } = {
  '/ventas': 'ventas',
  '/productos': 'productos',
  '/caja': 'caja',
  '/clientes': 'clientes',
  '/proveedores': 'proveedores',
  '/gestion-pedido': 'gestion_pedidos',
  '/inventario': 'inventario',
  '/reporte': 'reportes',
  '/usuarios': 'usuarios',
  '/configuracion': 'configuracion',
  '/carga': 'carga',
  '/dashboard': 'dashboard',
  '/gestion-roles': 'usuarios' // Gestionar roles requiere permiso de usuarios
};

export const permissionsGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // Si no está autenticado, redirigir al login
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.getCurrentUser();
  
  // Si no hay usuario, redirigir al login
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // Obtener la ruta actual
  const ruta = state.url.split('?')[0]; // Remover query params si existen
  const permisoRequerido = RUTA_A_PERMISO[ruta];

  // Si la ruta no requiere permiso específico, permitir acceso
  if (!permisoRequerido) {
    return true;
  }

  // Verificar si el usuario tiene el permiso requerido
  const permisos = user.permisos || {};
  
  if (permisos[permisoRequerido] === true) {
    return true;
  }

  // Si no tiene permiso, redirigir al dashboard
  router.navigate(['/dashboard']);
  
  // Intentar mostrar mensaje (puede fallar si el contexto no está listo)
  try {
    snackBar.open('No tienes permiso para acceder a esta sección', 'Cerrar', {
      duration: 4000,
      panelClass: ['error-snackbar']
    });
  } catch (error) {
    // Si falla, el mensaje se puede mostrar desde el layout
    console.warn('No se pudo mostrar el mensaje de error en el guard');
  }
  
  return false;
};

