import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinataireList } from './destinataire-list';

describe('DestinataireList', () => {
  let component: DestinataireList;
  let fixture: ComponentFixture<DestinataireList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinataireList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinataireList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
