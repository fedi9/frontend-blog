import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  sessionExpiredMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Récupérer le message d'expiration de session depuis les query params
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.sessionExpiredMessage = params['message'];
      }
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
          sessionStorage.setItem('token', response.token);

          // 🔍 Debug : afficher le contenu du token dans la console
          const payload = JSON.parse(atob(response.token.split('.')[1]));
          console.log('Contenu du token :', payload);

          sessionStorage.setItem('role', payload.role);

          // Redirection selon rôle
          const role = payload.role.toLowerCase();
          console.log('Redirection vers:', `/dashboard/${role}`);
          
          // Rediriger vers le dashboard approprié ou vers home pour les lecteurs
          if (role === 'lecteur') {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate([`/dashboard/${role}`]);
          }
        },
        error: (err) => {
          console.error('Erreur de connexion', err);
          // Optionnel : afficher un message d'erreur utilisateur
        }
      });
    }
  }
}
