import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCostumes } from './manage-costumes';

describe('ManageCostumes', () => {
  let component: ManageCostumes;
  let fixture: ComponentFixture<ManageCostumes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCostumes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCostumes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
