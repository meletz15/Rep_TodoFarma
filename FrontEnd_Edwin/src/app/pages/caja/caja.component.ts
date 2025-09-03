import { Component } from '@angular/core';
import { PlaceholderComponent } from '../../components/placeholder.component';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder
      title="Módulo de Caja"
      description="Gestión de caja y transacciones"
      icon="account_balance_wallet"
      iconBgClass="bg-yellow-100"
      iconClass="text-yellow-600">
    </app-placeholder>
  `
})
export class CajaComponent {}
