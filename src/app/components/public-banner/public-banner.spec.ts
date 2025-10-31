import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicBanner } from './public-banner';

describe('PublicBanner', () => {
  let component: PublicBanner;
  let fixture: ComponentFixture<PublicBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicBanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
