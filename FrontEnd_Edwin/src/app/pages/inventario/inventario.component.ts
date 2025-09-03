import { Component } from '@angular/core';
import { PlaceholderComponent } from '../../components/placeholder.component';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder
      title="Módulo de Inventario"
      description="Control de inventario y stock"
      icon="assessment"
      iconBgClass="bg-indigo-100"
      iconClass="text-indigo-600">
    </app-placeholder>
  `
})
export class InventarioComponent {}
