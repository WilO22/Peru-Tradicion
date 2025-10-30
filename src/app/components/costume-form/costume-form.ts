// src/app/components/costume-form/costume-form.ts
import { Component, inject, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'; // ¡Importante para [(ngModel)]!
import { CostumeModel, CostumeSize } from '../../interfaces/costume.model';
import { Costume } from '../../services/costume'; // Importamos el servicio

@Component({
  selector: 'app-costume-form',
  standalone: true,
  imports: [
    FormsModule // Añadimos FormsModule para usar ngModel
  ],
  templateUrl: './costume-form.html',
})
export class CostumeForm implements OnInit {
  // --- Inyección de Dependencias (Moderna) ---
  private costumeService = inject(Costume);

  // --- Entradas y Salidas ---
  // @Input() recibe el disfraz a editar. Si es 'null', es un formulario de "Crear".
  @Input() costumeToEdit: CostumeModel | null = null;
  
  // @Output() avisa al componente padre (la tabla) que debe cerrarse.
  @Output() close = new EventEmitter<void>();

  // --- Estado del Componente ---
  // 'costume' es el objeto local que está enlazado al formulario con [(ngModel)]
  public costume: Partial<CostumeModel> = {};
  public allSizes: CostumeSize[] = ['S', 'M', 'L', 'XL'];
  public isEditing = false;
  public isLoading = signal(false); // Signal para el estado de carga

  // 'ngOnInit' es un hook del ciclo de vida que se ejecuta cuando el componente se inicializa.
  ngOnInit() {
    if (this.costumeToEdit) {
      // MODO EDICIÓN
      this.isEditing = true;
      // Creamos una *copia* del objeto para evitar mutaciones inesperadas del original
      this.costume = { ...this.costumeToEdit };
    } else {
      // MODO CREACIÓN
      this.isEditing = false;
      // Definimos el estado inicial para un disfraz nuevo
      this.costume = {
        name: '',
        region: 'Costa',
        price: 0,
        image: 'https://placehold.co/400x500/e2e8f0/94a3b8?text=Imagen',
        sizes: [],
        description: ''
      };
    }
  }

  // Método que se llama cuando el formulario se envía
  async onSubmit() {
    if (this.isLoading()) return; // Prevenir doble envío
    this.isLoading.set(true);

    try {
      if (this.isEditing && this.costume.id) {
        // --- Lógica de Actualización ---
        const costumeId = this.costume.id;
        // Creamos un objeto 'data' sin el 'id' para enviar a Firestore
        const dataToUpdate = { ...this.costume };
        delete dataToUpdate.id; 
        
        await this.costumeService.updateCostume(costumeId, dataToUpdate);
        console.log('Disfraz actualizado!');
      } else {
        // --- Lógica de Creación ---
        // 'addCostume' espera Omit<CostumeModel, 'id'>, por lo que 'this.costume' coincide
        await this.costumeService.addCostume(this.costume as Omit<CostumeModel, 'id'>);
        console.log('Disfraz creado!');
      }
      this.onCancel(); // Cerramos el modal
    } catch (error) {
      console.error('Error guardando el disfraz:', error);
      alert('Hubo un error al guardar. Revisa la consola.');
    } finally {
      this.isLoading.set(false); // Reseteamos el estado de carga
    }
  }

  // Se llama al hacer clic en 'Cancelar'
  onCancel() {
    this.close.emit(); // Emite el evento 'close' al padre
  }

  // Gestiona los checkboxes de tallas
  onSizeChange(size: CostumeSize, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (!this.costume.sizes) {
      this.costume.sizes = []; // Asegurarse de que el array exista
    }

    if (isChecked) {
      // Añadir talla si no está
      if (!this.costume.sizes.includes(size)) {
        this.costume.sizes.push(size);
      }
    } else {
      // Quitar talla si sí está
      this.costume.sizes = this.costume.sizes.filter(s => s !== size);
    }
  }

  // Pequeña utilidad para el 'checked' state en el HTML
  isSizeChecked(size: CostumeSize): boolean {
    return this.costume.sizes?.includes(size) ?? false;
  }
}