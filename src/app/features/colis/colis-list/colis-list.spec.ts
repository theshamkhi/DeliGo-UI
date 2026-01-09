import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColisList } from './colis-list';

describe('ColisList', () => {
  let component: ColisList;
  let fixture: ComponentFixture<ColisList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColisList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColisList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
