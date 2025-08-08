import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { SharedModule } from './shared/shared.module';

// Pages
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard/admin-dashboard.component';
import { EditorDashboardComponent } from './pages/dashboard/editor-dashboard/editor-dashboard.component';
import { LecteurDashboardComponent } from './pages/dashboard/lecteur-dashboard/lecteur-dashboard.component';
import { RedacteurDashboardComponent } from './pages/dashboard/redacteur-dashboard/redacteur-dashboard.component';
import { CommentSectionComponent } from './shared/components/comment-section/comment-section.component';
import { StatsDashboardComponent } from './pages/dashboard/admin-dashboard/stats-dashboard/stats-dashboard.component';

// Chart.js
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    AdminDashboardComponent,
    EditorDashboardComponent,
    LecteurDashboardComponent,
    RedacteurDashboardComponent,
    CommentSectionComponent,
    StatsDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgChartsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
