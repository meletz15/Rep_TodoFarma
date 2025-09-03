import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-xl shadow-lg p-8 text-center">
          <div class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
               [ngClass]="iconBgClass">
            <mat-icon [class]="iconClass" class="text-4xl">{{ icon }}</mat-icon>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ title }}</h1>
          <p class="text-xl text-gray-600 mb-8">{{ description }}</p>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-yellow-800 font-medium">🚧 Próximamente</p>
            <p class="text-yellow-700 text-sm mt-2">Este módulo estará disponible en futuras versiones.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PlaceholderComponent {
  @Input() title: string = 'Módulo';
  @Input() description: string = 'Descripción del módulo';
  @Input() icon: string = 'build';
  @Input() iconBgClass: string = 'bg-gray-100';
  @Input() iconClass: string = 'text-gray-600';
}
