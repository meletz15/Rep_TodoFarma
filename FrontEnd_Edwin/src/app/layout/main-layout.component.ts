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
      disponible: false
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
      disponible: false
    },
    {
      title: 'Clientes',
      description: 'Gestión de clientes y contactos',
      icon: 'people',
      route: '/clientes',
      disponible: true
    },
    {
      title: 'Gestión Pedido',
      description: 'Gestión de pedidos y entregas',
      icon: 'local_shipping',
      route: '/gestion-pedido',
      disponible: false
    },
    {
      title: 'Inventario',
      description: 'Control de inventario y stock',
      icon: 'assessment',
      route: '/inventario',
      disponible: false
    },
    {
      title: 'Reporte',
      description: 'Reportes y estadísticas del negocio',
      icon: 'analytics',
      route: '/reporte',
      disponible: false
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
      disponible: false
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
