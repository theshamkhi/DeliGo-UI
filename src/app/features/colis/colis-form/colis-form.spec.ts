import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColisForm } from './colis-form';

describe('ColisForm', () => {
  let component: ColisForm;
  let fixture: ComponentFixture<ColisForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColisForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColisForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
