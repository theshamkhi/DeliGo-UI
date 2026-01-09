import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivreurList } from './livreur-list';

describe('LivreurList', () => {
  let component: LivreurList;
  let fixture: ComponentFixture<LivreurList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivreurList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LivreurList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
