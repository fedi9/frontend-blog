import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

    constructor(private authService: AuthService, private router: Router) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

getDashboardRoute(): string {
  const role = this.authService.getUserRole();
  return role ? `/dashboard/${role.toLowerCase()}` : '/home';
}


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
