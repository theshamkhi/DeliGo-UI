import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinataireForm } from './destinataire-form';

describe('DestinataireForm', () => {
  let component: DestinataireForm;
  let fixture: ComponentFixture<DestinataireForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinataireForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinataireForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
