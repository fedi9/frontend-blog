import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorDashboardComponent } from './editor-dashboard.component';

describe('EditorDashboardComponent', () => {
  let component: EditorDashboardComponent;
  let fixture: ComponentFixture<EditorDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditorDashboardComponent]
    });
    fixture = TestBed.createComponent(EditorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
