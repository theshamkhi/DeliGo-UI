import { TestBed } from '@angular/core/testing';

import { Colis } from './colis';

describe('Colis', () => {
  let service: Colis;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Colis);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
