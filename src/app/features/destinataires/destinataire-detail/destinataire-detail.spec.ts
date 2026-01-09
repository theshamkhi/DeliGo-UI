import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinataireDetail } from './destinataire-detail';

describe('DestinataireDetail', () => {
  let component: DestinataireDetail;
  let fixture: ComponentFixture<DestinataireDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinataireDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinataireDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
