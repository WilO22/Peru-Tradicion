// src/app/shared/components/costume-form-modal/costume-form-modal.ts

import { Component, EventEmitter, Input, Output, inject, OnInit, signal, OnChanges, SimpleChanges } from '@angular/core';
// 👇 FormBuilder, FormGroup, ReactiveFormsModule, Validators para formularios
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Para @if, @for, ngClass, etc.
import { Costume } from '../../../core/models/costume';

const ALL_SIZES: Costume['sizes'][number][] = ['S', 'M', 'L', 'XL'];

// Validador personalizado para requerir al menos una talla seleccionada
function requireAtLeastOneSize(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const sizesGroup = control as FormGroup;
    const atLeastOneSelected = Object.values(sizesGroup.controls).some(ctrl => ctrl.value);
    return atLeastOneSelected ? null : { requireOneSize: true };
  };
}


@Component({
  selector: 'app-costume-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // <-- Módulos necesarios
  templateUrl: './costume-form-modal.html',
  styleUrls: ['./costume-form-modal.css']
})
export default class CostumeFormModal implements OnInit, OnChanges { // <-- Implementa OnChanges
  private fb = inject(FormBuilder);

  @Input() costumeToEdit: Costume | null = null;
  @Output() close = new EventEmitter<void>();
  // 👇 Emite un objeto con los datos Y el archivo de imagen
  @Output() save = new EventEmitter<{ costumeData: Partial<Costume>, imageFile?: File }>();

  costumeForm!: FormGroup;
  imagePreview = signal<string | null>(null);
  imageFile: File | null = null;
  availableSizes = ALL_SIZES;

  ngOnInit(): void {
    this.initForm(); // Inicializa el formulario al crear el componente
  }

  // Detecta cambios en el Input 'costumeToEdit' (cuando se abre para editar)
  ngOnChanges(changes: SimpleChanges): void {
     if (changes['costumeToEdit'] && this.costumeForm) {
       this.resetFormWithData(); // Resetea el formulario con los nuevos datos
     }
   }

  private initForm(): void {
    this.costumeForm = this.fb.group({
      name: ['', Validators.required],
      region: ['Costa', Validators.required],
      price: [null as number | null, [Validators.required, Validators.min(0)]],
      description: [''],
      sizes: this.fb.group(
        this.availableSizes.reduce((group, size) => {
          group[size] = [false]; // Inicia todos desmarcados
          return group;
        }, {} as { [key: string]: [boolean] }),
        { validators: requireAtLeastOneSize() } // <-- Añade el validador al grupo
      )
    });
    this.resetFormWithData(); // Carga datos iniciales si existen
  }

  // Función para resetear/rellenar el formulario
  private resetFormWithData(): void {
    this.costumeForm.reset({
      name: this.costumeToEdit?.name || '',
      region: this.costumeToEdit?.region || 'Costa',
      price: this.costumeToEdit?.price || null,
      description: this.costumeToEdit?.description || '',
      sizes: this.availableSizes.reduce((group, size) => {
        group[size] = this.costumeToEdit?.sizes?.includes(size) || false;
        return group;
      }, {} as { [key: string]: boolean }) // <-- Tipo simplificado aquí
    });
    this.imageFile = null; // Resetea el archivo seleccionado
    this.imagePreview.set(this.costumeToEdit?.image || null); // Actualiza la vista previa
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
       this.imagePreview.set(this.costumeToEdit?.image || null);
       // Limpia el input de archivo para poder seleccionar el mismo de nuevo si se cancela
       input.value = '';
    }
  }

  onSubmit(): void {
    if (this.costumeForm.invalid) {
      this.costumeForm.markAllAsTouched();
      return;
    }

    const formValue = this.costumeForm.value;
    const selectedSizes = Object.entries(formValue.sizes)
                              .filter(([key, value]) => value)
                              .map(([key]) => key as Costume['sizes'][number]);

    const costumeData: Partial<Costume> = {
      name: formValue.name,
      region: formValue.region,
      price: formValue.price,
      description: formValue.description,
      sizes: selectedSizes,
      // Si estamos editando y no se seleccionó nueva imagen, MANTENEMOS la URL vieja
      ...(!this.imageFile && this.costumeToEdit && { image: this.costumeToEdit.image }),
    };

    // Emitimos los datos Y el archivo (si existe)
    this.save.emit({ costumeData, imageFile: this.imageFile || undefined });
  }

  closeModal(): void {
    this.close.emit();
  }

  // Helpers para validación en HTML
  get f() { return this.costumeForm.controls; }
  get sizesFormGroup() { return this.costumeForm.get('sizes') as FormGroup; }
}