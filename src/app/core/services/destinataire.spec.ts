import { TestBed } from '@angular/core/testing';

import { Destinataire } from './destinataire';

describe('Destinataire', () => {
  let service: Destinataire;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Destinataire);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
