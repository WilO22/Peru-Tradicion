// src/app/components/costume-form/costume-form.ts
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CostumeModel, CostumeRegion, CostumeSize } from '../../interfaces/costume.model';

@Component({
  selector: 'app-costume-form',
  standalone: true,
  // Principio (Standalone): Importamos ReactiveFormsModule para los formularios
  imports: [ReactiveFormsModule],
  templateUrl: './costume-form.html',
  styleUrl: './costume-form.css'
})
export class CostumeForm implements OnInit {
  
  // --- Inyección de Dependencias ---
  #fb: FormBuilder = inject(FormBuilder);

  // --- Entradas y Salidas ---
  @Input() costume: CostumeModel | null = null; // null = Creando, Objeto = Editando
  @Output() close = new EventEmitter<void>();
  
  // Emitirá los datos del formulario, SIN el ID
  @Output() save = new EventEmitter<Omit<CostumeModel, 'id'>>();

  // --- Propiedades ---
  costumeForm: FormGroup;
  // Definimos las opciones para los selects y checkboxes
  allRegions: CostumeRegion[] = ['Costa', 'Sierra', 'Selva'];
  allSizes: CostumeSize[] = ['S', 'M', 'L', 'XL'];

  constructor() {
    // Inicializamos el formulario reactivo
    this.costumeForm = this.#fb.group({
      name: ['', Validators.required],
      region: ['Costa' as CostumeRegion, Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      description: [''],
      image: ['https://placehold.co/400x500/e2e8f0/94a3b8?text=Imagen', Validators.required], // URL de la imagen
      // Creamos un FormGroup anidado para las tallas
      sizes: this.#fb.group({
        S: [false],
        M: [false],
        L: [false],
        XL: [false]
      })
    });
  }

  ngOnInit(): void {
    // Si nos pasan un disfraz (modo edición), llenamos el formulario
    if (this.costume) {
      this.patchForm(this.costume);
    }
  }

  // Método para llenar el formulario en modo edición
  patchForm(costume: CostumeModel) {
    // Convertimos el array de tallas (ej. ['S', 'L'])
    // en un objeto de formulario (ej. { S: true, M: false, L: true, XL: false })
    const sizesPatch = this.allSizes.reduce((acc, size) => {
      acc[size] = costume.sizes.includes(size);
      return acc;
    }, {} as { [key in CostumeSize]: boolean });

    this.costumeForm.patchValue({
      name: costume.name,
      region: costume.region,
      price: costume.price,
      description: costume.description,
      image: costume.image,
      sizes: sizesPatch // Aplicamos el parche de tallas
    });
  }

  // --- Manejadores de Eventos ---

  onCancel() {
    this.close.emit(); // Emitimos el evento "cerrar"
  }

  onSubmit() {
    if (this.costumeForm.invalid) {
      this.costumeForm.markAllAsTouched();
      return;
    }

    // Obtenemos los valores crudos del formulario
    const formValue = this.costumeForm.value;

    // Convertimos el objeto de tallas (ej. { S: true, M: false, ... })
    // de vuelta a un array (ej. ['S'])
    const selectedSizes = Object.keys(formValue.sizes)
      .filter(size => formValue.sizes[size]) as CostumeSize[];

    // Preparamos los datos finales para emitir
    const costumeData: Omit<CostumeModel, 'id'> = {
      name: formValue.name,
      region: formValue.region,
      price: formValue.price,
      description: formValue.description,
      image: formValue.image,
      sizes: selectedSizes
    };

    // Emitimos el evento "guardar" con los datos
    this.save.emit(costumeData);
  }
}