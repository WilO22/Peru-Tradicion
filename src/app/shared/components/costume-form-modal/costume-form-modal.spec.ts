import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostumeFormModal } from './costume-form-modal';

describe('CostumeFormModal', () => {
  let component: CostumeFormModal;
  let fixture: ComponentFixture<CostumeFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostumeFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostumeFormModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
