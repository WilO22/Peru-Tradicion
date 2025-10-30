import { TestBed } from '@angular/core/testing';

import { Costume } from './costume';

describe('Costume', () => {
  let service: Costume;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Costume);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
