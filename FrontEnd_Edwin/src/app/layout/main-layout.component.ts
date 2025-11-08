import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

interface MenuItem {
  title: string;
  description: string;
  icon: string;
  route: string;
  disponible: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  currentUser: any = null;
  menuAbierto = false;
  
  menuItems: MenuItem[] = [
    {
      title: 'Ventas',
      description: 'Sistema de ventas y facturación',
      icon: 'point_of_sale',
      route: '/ventas',
      disponible: true
    },
    {
      title: 'Productos',
      description: 'Inventario y gestión de productos farmacéuticos',
      icon: 'inventory',
      route: '/productos',
      disponible: true
    },
    {
      title: 'Caja',
      description: 'Gestión de caja y transacciones',
      icon: 'account_balance_wallet',
      route: '/caja',
      disponible: true
    },
    {
      title: 'Clientes',
      description: 'Gestión de clientes y contactos',
      icon: 'people',
      route: '/clientes',
      disponible: true
    },
    {
      title: 'Gestión de Proveedores',
      description: 'Gestión de proveedores y contactos comerciales',
      icon: 'business',
      route: '/proveedores',
      disponible: true
    },
    {
      title: 'Gestión Pedido',
      description: 'Gestión de pedidos y entregas',
      icon: 'local_shipping',
      route: '/gestion-pedido',
      disponible: true
    },
    {
      title: 'Inventario',
      description: 'Control de inventario y stock',
      icon: 'assessment',
      route: '/inventario',
      disponible: true
    },
    {
      title: 'Reporte',
      description: 'Reportes y estadísticas del negocio',
      icon: 'analytics',
      route: '/reporte',
      disponible: true
    },
    {
      title: 'Usuario',
      description: 'Gestión completa de usuarios del sistema',
      icon: 'person',
      route: '/usuarios',
      disponible: true
    },
    {
      title: 'Configuración',
      description: 'Configuración del sistema y preferencias',
      icon: 'settings',
      route: '/configuracion',
      disponible: true
    },
    {
      title: 'Carga',
      description: 'Carga masiva de datos desde Excel',
      icon: 'upload_file',
      route: '/carga',
      disponible: true
    },
    {
      title: 'Menú Inicio',
      description: 'Página principal del sistema',
      icon: 'home',
      route: '/dashboard',
      disponible: true
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.filtrarMenuSegunPermisos();
    
    // Suscribirse a cambios en el usuario para actualizar el menú
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.filtrarMenuSegunPermisos();
    });
  }

  filtrarMenuSegunPermisos(): void {
    const user = this.authService.getCurrentUser();
    if (!user || !user.permisos) {
      // Si no hay permisos, ocultar todo excepto dashboard
      this.menuItems.forEach(item => {
        item.disponible = item.route === '/dashboard';
      });
      return;
    }

    const permisos = user.permisos;

    // Mapear rutas a claves de permisos
    const mapeoPermisos: { [key: string]: string } = {
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
      '/dashboard': 'dashboard'
    };

    // Filtrar menú según permisos
    this.menuItems.forEach(item => {
      const permisoKey = mapeoPermisos[item.route];
      if (permisoKey) {
        item.disponible = permisos[permisoKey] === true;
      } else {
        // Si no hay mapeo, mantener disponible
        item.disponible = true;
      }
    });
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  onMenuClick(item: MenuItem): void {
    if (item.disponible) {
      this.router.navigate([item.route]);
      // Cerrar menú en móvil después de navegar
      if (window.innerWidth < 768) {
        this.menuAbierto = false;
      }
    } else {
      this.snackBar.open(`${item.title} está bloqueado. Estará disponible próximamente.`, 'Cerrar', {
        duration: 4000,
        panelClass: ['warning-snackbar']
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.snackBar.open('Sesión cerrada correctamente', 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
}
