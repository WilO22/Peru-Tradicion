// src/app/components/banner-form/banner-form.ts
import {
  Component,
  inject,
  signal,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HotToastService } from '@ngxpert/hot-toast';
import { Banner } from '../../services/banner';
import { BannerModel } from '../../interfaces/banner.model';
import { Storage, UploadStatus } from '../../services/storage';
import { Subscription } from 'rxjs';

// --- 1. Importar el nuevo servicio ---
import { Gemini } from '../../services/gemini';

@Component({
  selector: 'app-banner-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './banner-form.html',
})
export class BannerForm implements OnChanges {
  // --- Inyección de Dependencias ---
  #fb = inject(FormBuilder);
  #bannerService = inject(Banner);
  #storageService = inject(Storage);
  #toast = inject(HotToastService);
  // --- 2. Inyectar el servicio ---
  #geminiService = inject(Gemini);

  // --- Inputs y Outputs ---
  @Input() bannerToEdit: BannerModel | null = null;
  @Output() closeModal = new EventEmitter<void>();

  // --- Signals de Estado ---
  isEditing = signal(false);
  isUploading = signal(false);
  uploadProgress = signal(0);
  imagePreviewUrl = signal<string | null>(null);

  // --- 3. Nuevo Signal para la carga de IA ---
  isGeneratingAI = signal(false);

  #uploadSubscription: Subscription | null = null;

  // --- Formulario Reactivo ---
  bannerForm: FormGroup;

  constructor() {
    this.bannerForm = this.#fb.group({
      festivity: ['', [Validators.required, Validators.minLength(3)]],
      title: ['', [Validators.required, Validators.minLength(5)]],
      subtitle: ['', Validators.required],
      buttonText: ['', Validators.required],
      image: [null, Validators.required], // La URL de la imagen
      // 'isActive' no se maneja aquí, se maneja en la tabla
    });
  }

  // Hook para reaccionar a cambios en el @Input
  ngOnChanges(changes: SimpleChanges) {
    if (changes['bannerToEdit'] && this.bannerToEdit) {
      // --- Modo Edición ---
      this.isEditing.set(true);
      this.bannerForm.patchValue(this.bannerToEdit);
      this.bannerForm.get('image')?.clearValidators(); // La imagen ya existe
      this.bannerForm.get('image')?.updateValueAndValidity();
      this.imagePreviewUrl.set(this.bannerToEdit.image);
    } else {
      // --- Modo Creación ---
      this.isEditing.set(false);
      this.bannerForm.reset();
      this.bannerForm.get('image')?.setValidators(Validators.required);
      this.bannerForm.get('image')?.updateValueAndValidity();
      this.imagePreviewUrl.set(null);
    }
  }

  // --- Manejo de Subida de Archivo ---
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = () => this.imagePreviewUrl.set(reader.result as string);
      reader.readAsDataURL(file);

      if (this.#uploadSubscription) {
        this.#uploadSubscription.unsubscribe();
      }

      this.isUploading.set(true);
      // Usamos la ruta 'banners' en el Storage
      this.#uploadSubscription = this.#storageService
        .uploadFile(file, 'banners') 
        .subscribe({
          next: (status: UploadStatus) => {
            this.uploadProgress.set(status.progress);
            if (status.downloadURL) {
              this.bannerForm.get('image')?.setValue(status.downloadURL);
              this.isUploading.set(false);
              this.#toast.success('Imagen de banner subida');
            }
          },
          error: (err) => {
            console.error(err);
            this.isUploading.set(false);
            this.imagePreviewUrl.set(null);
            this.#toast.error('Error al subir la imagen.');
          },
        });
    }
  }

  // --- 4. Nuevo método para el botón de IA ---
  async onGenerateContent() {
    const festivity = this.bannerForm.get('festivity')?.value;
    if (!festivity) {
      this.#toast.error('Por favor, ingresa la Festividad primero.');
      return;
    }

    this.isGeneratingAI.set(true);
    try {
      const response = await this.#geminiService.generateBannerContent(festivity);

      // Seteamos dos valores a la vez
      this.bannerForm.patchValue({
        title: response.title,
        subtitle: response.subtitle
      });

    } catch (error) {
      console.error(error);
      this.#toast.error('Error al generar contenido con IA.');
    } finally {
      this.isGeneratingAI.set(false);
    }
  }

  // --- Envío del Formulario ---
  async onSubmit() {
    if (this.bannerForm.invalid) {
      this.bannerForm.markAllAsTouched();
      this.#toast.error('Por favor, completa el formulario.');
      return;
    }
    if (this.isUploading()) {
      this.#toast.warning('Espera a que termine de subir la imagen.');
      return;
    }

    // Preparamos los datos
    const bannerData: Omit<BannerModel, 'id' | 'isActive'> = this.bannerForm.value;

    try {
      if (this.isEditing() && this.bannerToEdit) {
        // --- Lógica de ACTUALIZAR ---
        await this.#bannerService.updateBanner(this.bannerToEdit.id, bannerData);
        this.#toast.success('Banner actualizado');
      } else {
        // --- Lógica de CREAR ---
        // 'isActive' se maneja en el servicio (el primero es 'true')
        await this.#bannerService.addBanner(bannerData as BannerModel); 
        this.#toast.success('Banner creado');
      }
      this.closeModal.emit(); // Emitimos el evento para cerrar
    } catch (error) {
      console.error(error);
      this.#toast.error('Error al guardar el banner.');
    }
  }
}