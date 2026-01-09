import { TestBed } from '@angular/core/testing';

import { Livreur } from './livreur';

describe('Livreur', () => {
  let service: Livreur;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Livreur);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
