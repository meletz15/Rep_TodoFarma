import { Component } from '@angular/core';
import { PlaceholderComponent } from '../../components/placeholder.component';

@Component({
  selector: 'app-gestion-pedido',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder
      title="Módulo de Gestión Pedido"
      description="Gestión de pedidos y entregas"
      icon="local_shipping"
      iconBgClass="bg-orange-100"
      iconClass="text-orange-600">
    </app-placeholder>
  `
})
export class GestionPedidoComponent {}
