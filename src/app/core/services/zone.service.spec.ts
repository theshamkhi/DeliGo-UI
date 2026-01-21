import { TestBed } from '@angular/core/testing';

import { Zone } from './zone';

describe('Zone', () => {
  let service: Zone;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Zone);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
