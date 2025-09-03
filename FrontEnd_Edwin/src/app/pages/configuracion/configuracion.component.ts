import { Component } from '@angular/core';
import { PlaceholderComponent } from '../../components/placeholder.component';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder
      title="Módulo de Configuración"
      description="Configuración del sistema y preferencias"
      icon="settings"
      iconBgClass="bg-gray-100"
      iconClass="text-gray-600">
    </app-placeholder>
  `
})
export class ConfiguracionComponent {}
