import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedacteurDashboardComponent } from './redacteur-dashboard.component';

describe('RedacteurDashboardComponent', () => {
  let component: RedacteurDashboardComponent;
  let fixture: ComponentFixture<RedacteurDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RedacteurDashboardComponent]
    });
    fixture = TestBed.createComponent(RedacteurDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
