import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard/admin-dashboard.component';
import { EditorDashboardComponent } from './pages/dashboard/editor-dashboard/editor-dashboard.component';
import { RedacteurDashboardComponent } from './pages/dashboard/redacteur-dashboard/redacteur-dashboard.component';
import { StatsDashboardComponent } from './pages/dashboard/admin-dashboard/stats-dashboard/stats-dashboard.component';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LecteurDashboardComponent } from './pages/dashboard/lecteur-dashboard/lecteur-dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Dashboards protégés
  {
    path: 'dashboard/admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'dashboard/admin/stats',
    component: StatsDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'dashboard/editeur',
    component: EditorDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Editeur'] }
  },
  {
    path: 'dashboard/redacteur',
    component: RedacteurDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Redacteur'] }
  },
   {
    path: 'dashboard/lecteur',
    component: LecteurDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Lecteur'] }
  },

  // 404 (optionnel)
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
