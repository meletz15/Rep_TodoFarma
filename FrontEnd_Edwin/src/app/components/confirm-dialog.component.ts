import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  titulo: string;
  mensaje: string;
  confirmarTexto?: string;
  cancelarTexto?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ data.titulo }}</h2>
      <p class="text-gray-600 mb-6">{{ data.mensaje }}</p>
      <div class="flex justify-end gap-3">
        <button 
          mat-button 
          (click)="onCancel()"
          class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {{ data.cancelarTexto || 'Cancelar' }}
        </button>
        <button 
          mat-button 
          (click)="onConfirm()"
          class="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
        >
          {{ data.confirmarTexto || 'Confirmar' }}
        </button>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
