import { Component } from '@angular/core';
import { PlaceholderComponent } from '../../components/placeholder.component';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder
      title="Módulo de Ventas"
      description="Sistema de ventas y facturación"
      icon="point_of_sale"
      iconBgClass="bg-blue-100"
      iconClass="text-blue-600">
    </app-placeholder>
  `
})
export class VentasComponent {}
