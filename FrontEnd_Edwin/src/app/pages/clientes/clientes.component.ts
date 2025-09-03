import { Component } from '@angular/core';
import { PlaceholderComponent } from '../../components/placeholder.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder
      title="Módulo de Clientes"
      description="Gestión de clientes y contactos"
      icon="people"
      iconBgClass="bg-purple-100"
      iconClass="text-purple-600">
    </app-placeholder>
  `
})
export class ClientesComponent {}
