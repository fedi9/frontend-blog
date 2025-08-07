import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  // onSubmit(): void {
  //   if (this.loginForm.valid) {
  //     this.authService.login(this.loginForm.value).subscribe({
  //       next: (response) => {
  //         localStorage.setItem('token', response.token);

          

  //         // Extraire rôle du token pour redirection
  //         const payload = JSON.parse(atob(response.token.split('.')[1]));
  //         localStorage.setItem('role', payload.role);

  //         // Redirection selon rôle
  //         const role = payload.role.toLowerCase();
  //         this.router.navigate([`/dashboard/${role}`]);
  //       },
  //       error: (err) => {
  //         console.error('Erreur de connexion', err);
  //         // Tu peux afficher un message à l'utilisateur ici
  //       }
  //     });
  //   }
  // }
    onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);

          // 🔍 Debug : afficher le contenu du token dans la console
          const payload = JSON.parse(atob(response.token.split('.')[1]));
          console.log('Contenu du token :', payload); // <-- Cette ligne t'aidera à déboguer

          localStorage.setItem('role', payload.role);

          // Redirection selon rôle
          const role = payload.role.toLowerCase();
          console.log('Redirection vers:', `/dashboard/${role}`);
          this.router.navigate([`/dashboard/${role}`]);
        },
        error: (err) => {
          console.error('Erreur de connexion', err);
          // Optionnel : afficher un message d'erreur utilisateur
        }
      });
    }
  }
}
