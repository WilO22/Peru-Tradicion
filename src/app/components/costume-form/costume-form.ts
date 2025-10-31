// src/app/components/costume-form/costume-form.ts
import {
  Component,
  inject,
  signal,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  FormControl
} from '@angular/forms';

// ... (imports de angular) ...
import { HotToastService } from '@ngxpert/hot-toast';

// --- ESTA ES LA CORRECCIÓN ---
// 1. Importamos la CLASE 'Costume' desde el servicio
import { Costume } from '../../services/costume'; 
// 2. Importamos los TIPOS 'CostumeModel' y 'CostumeSize' desde el archivo de interfaces
import { CostumeModel, CostumeSize } from '../../interfaces/costume.model'; 

import { Storage, UploadStatus } from '../../services/storage';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-costume-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Importamos los módulos clave
  templateUrl: './costume-form.html',
})
export class CostumeForm implements OnChanges {
  // --- Principio: Inyección con inject() ---
  #fb = inject(FormBuilder);
  #costumeService = inject(Costume);
  #storageService = inject(Storage);
  #toast = inject(HotToastService);

  // --- Principio: Inputs y Outputs ---
  @Input() costumeToEdit: CostumeModel | null = null;
  @Output() closeModal = new EventEmitter<void>();

  // --- Principio: Gestión de Estado con Signals ---
  isEditing = signal(false);
  isUploading = signal(false);
  uploadProgress = signal(0);
  imagePreviewUrl = signal<string | null>(null);

  // Lista fija de tallas para los checkboxes
  readonly allSizes: CostumeSize[] = ['S', 'M', 'L', 'XL'];

  // Variable para manejar la suscripción a la subida de archivos
  #uploadSubscription: Subscription | null = null;

  // --- Principio: Reactive Forms ---
  costumeForm: FormGroup;

  constructor() {
    this.costumeForm = this.#fb.group({
      id: [null], // Se usará solo para editar
      name: ['', [Validators.required, Validators.minLength(3)]],
      region: ['Costa', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      description: [''],
      image: [null, Validators.required], // La URL de la imagen
      // --- Práctica Moderna: FormArray ---
      // Creamos un array de FormControls para las tallas
      sizes: this.#fb.array(
        this.allSizes.map(() => new FormControl(false))
      )
    });
  }

  // Hook de Angular: Se dispara cuando el @Input() 'costumeToEdit' cambia
  ngOnChanges(changes: SimpleChanges) {
    if (changes['costumeToEdit'] && this.costumeToEdit) {
      // --- Modo Edición ---
      this.isEditing.set(true);
      // Rellenamos el formulario con los datos del disfraz
      this.costumeForm.patchValue(this.costumeToEdit);
      // Marcamos la URL de la imagen como válida (ya existe)
      this.costumeForm.get('image')?.clearValidators();
      this.costumeForm.get('image')?.updateValueAndValidity();
      // Seteamos la vista previa
      this.imagePreviewUrl.set(this.costumeToEdit.image);
      // Seteamos los checkboxes de tallas
      this.setSizesFormArray(this.costumeToEdit.sizes);
    } else {
      // --- Modo Creación ---
      this.isEditing.set(false);
      this.costumeForm.reset({
        region: 'Costa', // Valor por defecto
        price: 0,
        sizes: this.allSizes.map(() => false) // Reseteamos checkboxes
      });
      // Requerimos la imagen al crear
      this.costumeForm.get('image')?.setValidators(Validators.required);
      this.costumeForm.get('image')?.updateValueAndValidity();
      this.imagePreviewUrl.set(null);
    }
  }

  // Helper para castear el FormArray (para el HTML)
  get sizesFormArray() {
    return this.costumeForm.get('sizes') as FormArray;
  }

  // Helper para setear los checkboxes
  setSizesFormArray(selectedSizes: CostumeSize[]) {
    this.sizesFormArray.controls.forEach((control, index) => {
      const size = this.allSizes[index];
      if (selectedSizes.includes(size)) {
        control.setValue(true);
      } else {
        control.setValue(false);
      }
    });
  }

  // Helper para convertir los checkboxes [true, false, true] en ['S', 'L']
  getSelectedSizes(): CostumeSize[] {
    return this.costumeForm.value.sizes
      .map((checked: boolean, index: number) => checked ? this.allSizes[index] : null)
      .filter((value: CostumeSize | null) => value !== null);
  }

  // --- Manejo de Subida de Archivo ---
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // 1. Mostrar vista previa local
      const reader = new FileReader();
      reader.onload = () => this.imagePreviewUrl.set(reader.result as string);
      reader.readAsDataURL(file);

      // 2. Cancelar subida anterior si existe
      if (this.#uploadSubscription) {
        this.#uploadSubscription.unsubscribe();
      }

      // 3. Iniciar nueva subida
      this.isUploading.set(true);
      this.#uploadSubscription = this.#storageService.uploadFile(file, 'costumes')
        .subscribe({
          next: (status: UploadStatus) => {
            // Actualizamos el Signal de progreso
            this.uploadProgress.set(status.progress);

            // Si la subida terminó, guardamos la URL en el formulario
            if (status.downloadURL) {
              this.costumeForm.get('image')?.setValue(status.downloadURL);
              this.isUploading.set(false);
              this.#toast.success('Imagen subida con éxito');
            }
          },
          error: (err) => {
            console.error(err);
            this.isUploading.set(false);
            this.imagePreviewUrl.set(null); // Limpiamos vista previa en error
            this.#toast.error('Error al subir la imagen.');
          }
        });
    }
  }

  // --- Envío del Formulario ---
  async onSubmit() {
    if (this.costumeForm.invalid) {
      this.costumeForm.markAllAsTouched();
      this.#toast.error('Por favor, completa el formulario.');
      return;
    }

    if (this.isUploading()) {
      this.#toast.warning('Espera a que termine de subir la imagen.');
      return;
    }

    // Preparamos los datos
    const formData = this.costumeForm.value;
    const costumeData: Omit<CostumeModel, 'id'> = {
      name: formData.name,
      region: formData.region,
      price: formData.price,
      description: formData.description,
      image: formData.image, // <-- Esta es la downloadURL
      sizes: this.getSelectedSizes()
    };

    try {
      if (this.isEditing() && this.costumeToEdit) {
        // --- Lógica de ACTUALIZAR ---
        await this.#costumeService.updateCostume(this.costumeToEdit.id, costumeData);
        this.#toast.success('Disfraz actualizado');
      } else {
        // --- Lógica de CREAR ---
        await this.#costumeService.addCostume(costumeData as CostumeModel);
        this.#toast.success('Disfraz creado');
      }
      this.closeModal.emit(); // Emitimos el evento para cerrar
    } catch (error) {
      console.error(error);
      this.#toast.error('Error al guardar el disfraz.');
    }
  }
}