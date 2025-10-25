import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerFormModal } from './banner-form-modal';

describe('BannerFormModal', () => {
  let component: BannerFormModal;
  let fixture: ComponentFixture<BannerFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerFormModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
