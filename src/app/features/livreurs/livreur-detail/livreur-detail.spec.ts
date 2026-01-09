import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivreurDetail } from './livreur-detail';

describe('LivreurDetail', () => {
  let component: LivreurDetail;
  let fixture: ComponentFixture<LivreurDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivreurDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivreurDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
