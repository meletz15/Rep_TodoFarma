import { Component } from '@angular/core';
import { PlaceholderComponent } from '../../components/placeholder.component';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder
      title="Módulo de Productos"
      description="Inventario y gestión de productos farmacéuticos"
      icon="inventory"
      iconBgClass="bg-green-100"
      iconClass="text-green-600">
    </app-placeholder>
  `
})
export class ProductosComponent {}
