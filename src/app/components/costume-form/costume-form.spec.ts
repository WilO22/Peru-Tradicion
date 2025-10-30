import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostumeForm } from './costume-form';

describe('CostumeForm', () => {
  let component: CostumeForm;
  let fixture: ComponentFixture<CostumeForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostumeForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostumeForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
