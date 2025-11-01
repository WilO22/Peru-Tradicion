// src/app/components/confirm-modal/confirm-modal.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para @if

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.html',
})
export class ConfirmModal {
  // --- Principio: Inputs y Outputs ---

  // @Input() permite al componente padre pasar datos HACIA ADENTRO
  @Input() title: string = 'Confirmar'; // Título por defecto
  @Input() message: string = '¿Estás seguro?'; // Mensaje por defecto

  // @Output() permite a este componente enviar eventos HACIA AFUERA
  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  // --- Métodos de Eventos ---
  onConfirm() {
    this.confirm.emit(); // Emite el evento 'confirm'
  }

  onClose() {
    this.close.emit(); // Emite el evento 'close'
  }
}