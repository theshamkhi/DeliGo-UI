import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColisDetail } from './colis-detail';

describe('ColisDetail', () => {
  let component: ColisDetail;
  let fixture: ComponentFixture<ColisDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColisDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColisDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
