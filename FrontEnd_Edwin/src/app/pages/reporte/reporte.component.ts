import { Component } from '@angular/core';
import { PlaceholderComponent } from '../../components/placeholder.component';

@Component({
  selector: 'app-reporte',
  standalone: true,
  imports: [PlaceholderComponent],
  template: `
    <app-placeholder
      title="Módulo de Reporte"
      description="Reportes y estadísticas del negocio"
      icon="analytics"
      iconBgClass="bg-red-100"
      iconClass="text-red-600">
    </app-placeholder>
  `
})
export class ReporteComponent {}
