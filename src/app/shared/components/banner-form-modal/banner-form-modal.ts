// 
//---------------------------------------------------

// src/app/shared/components/banner-form-modal/banner-form-modal.ts

import { Component, EventEmitter, Input, Output, inject, OnInit, signal, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Banner } from '../../../core/models/banner'; // <-- Verifica la ruta

@Component({
  selector: 'app-banner-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './banner-form-modal.html',
  styleUrl: './banner-form-modal.css'
})
export default class BannerFormModal implements OnInit, OnChanges { // <-- Nombre de clase sin sufijo
  private fb = inject(FormBuilder);

  @Input() bannerToEdit: Banner | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ bannerData: Partial<Banner>, imageFile?: File }>();

  bannerForm!: FormGroup;
  imagePreview = signal<string | null>(null);
  imageFile: File | null = null;

  ngOnInit(): void {
    this.initForm();
  }

   ngOnChanges(changes: SimpleChanges): void {
     if (changes['bannerToEdit'] && this.bannerForm) {
       this.resetFormWithData();
     }
   }

  private initForm(): void {
    this.bannerForm = this.fb.group({
      festivity: ['', Validators.required],
      title: ['', Validators.required],
      subtitle: [''],
      buttonText: ['', Validators.required],
    });
    this.resetFormWithData();
  }

  private resetFormWithData(): void {
     this.bannerForm.reset({
       festivity: this.bannerToEdit?.festivity || '',
       title: this.bannerToEdit?.title || '',
       subtitle: this.bannerToEdit?.subtitle || '',
       buttonText: this.bannerToEdit?.buttonText || '',
     });
     this.imageFile = null;
     this.imagePreview.set(this.bannerToEdit?.image || null);
   }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
      reader.readAsDataURL(this.imageFile);
    } else {
       this.imageFile = null;
       this.imagePreview.set(this.bannerToEdit?.image || null);
       input.value = '';
    }
  }

  onSubmit(): void {
    if (this.bannerForm.invalid) {
      this.bannerForm.markAllAsTouched();
      // Añadimos validación extra: se necesita imagen si es banner nuevo
      if (!this.bannerToEdit && !this.imageFile) {
         alert("La imagen es obligatoria para nuevos banners."); // Simple alerta
         return;
      }
      return;
    }

    const formValue = this.bannerForm.value;
    const bannerData: Partial<Banner> = {
      festivity: formValue.festivity,
      title: formValue.title,
      subtitle: formValue.subtitle,
      buttonText: formValue.buttonText,
      // Si editamos y no hay nueva imagen, mantenemos la URL vieja
      ...(!this.imageFile && this.bannerToEdit && { image: this.bannerToEdit.image }),
    };

    this.save.emit({ bannerData, imageFile: this.imageFile || undefined });
  }

  closeModal(): void {
    this.close.emit();
  }

  get f() { return this.bannerForm.controls; }
}