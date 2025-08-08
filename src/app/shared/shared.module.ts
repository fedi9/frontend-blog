import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from './navbar/navbar.component';
import { NotificationSettingsComponent } from './components/notification-settings/notification-settings.component';

@NgModule({
  declarations: [
    NavbarComponent,
    NotificationSettingsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  exports: [
    NavbarComponent,
    NotificationSettingsComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class SharedModule { }
