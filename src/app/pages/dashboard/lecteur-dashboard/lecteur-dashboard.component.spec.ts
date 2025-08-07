import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecteurDashboardComponent } from './lecteur-dashboard.component';

describe('LecteurDashboardComponent', () => {
  let component: LecteurDashboardComponent;
  let fixture: ComponentFixture<LecteurDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LecteurDashboardComponent]
    });
    fixture = TestBed.createComponent(LecteurDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
