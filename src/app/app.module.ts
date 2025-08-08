import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component'; // assure-toi que le chemin est correct
import { LoginComponent } from './pages/login/login.component';
import {AdminDashboardComponent} from './pages/dashboard/admin-dashboard/admin-dashboard.component';
import {EditorDashboardComponent} from './pages/dashboard/editor-dashboard/editor-dashboard.component';
import {LecteurDashboardComponent} from './pages/dashboard/lecteur-dashboard/lecteur-dashboard.component';
import {RedacteurDashboardComponent} from './pages/dashboard/redacteur-dashboard/redacteur-dashboard.component';
import { CommentSectionComponent } from './shared/components/comment-section/comment-section.component';


import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';


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
    CommentSectionComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
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
