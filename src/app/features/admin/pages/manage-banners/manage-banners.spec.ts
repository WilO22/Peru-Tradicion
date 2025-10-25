import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBanners } from './manage-banners';

describe('ManageBanners', () => {
  let component: ManageBanners;
  let fixture: ComponentFixture<ManageBanners>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBanners]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageBanners);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
