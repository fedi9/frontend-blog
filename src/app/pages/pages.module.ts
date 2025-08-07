import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard/admin-dashboard.component';
import { EditorDashboardComponent } from './dashboard/editor-dashboard/editor-dashboard.component';
import { RedacteurDashboardComponent } from './dashboard/redacteur-dashboard/redacteur-dashboard.component';
import { LecteurDashboardComponent } from './dashboard/lecteur-dashboard/lecteur-dashboard.component';



@NgModule({
  declarations: [
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    AdminDashboardComponent,
    EditorDashboardComponent,
    RedacteurDashboardComponent,
    LecteurDashboardComponent
  ],
  imports: [
    CommonModule
  ]
})
export class PagesModule { }
