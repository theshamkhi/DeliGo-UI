import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColisTracking } from './colis-tracking';

describe('ColisTracking', () => {
  let component: ColisTracking;
  let fixture: ComponentFixture<ColisTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColisTracking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColisTracking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
