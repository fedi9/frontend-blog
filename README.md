# Blog Collaboratif - Frontend

Interface utilisateur moderne pour une plateforme de blog collaboratif développée avec Angular 16, Bootstrap 5, Chart.js et Socket.io pour les fonctionnalités temps réel.

## 🚀 Installation et Exécution

### Prérequis

- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**
- **Angular CLI** (version 16)
- **Backend** : Le backend doit être démarré (voir README du backend)

### Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd blog-collaboratif-frontend
   ```

2. **Installer Angular CLI globalement** (si pas déjà installé)
   ```bash
   npm install -g @angular/cli@16
   ```

3. **Installer les dépendances**
   ```bash
   npm install
   ```

4. **Configuration de l'environnement**
   
   Vérifiez que les URLs du backend sont correctes dans les services :
   - Services d'authentification : `http://localhost:5001`
   - Services d'articles : `http://localhost:5002`

### Exécution

#### Mode Développement

```bash
# Démarrer le serveur de développement
ng serve

# Ou avec npm
npm start
```

L'application sera accessible sur : **http://localhost:4200**

#### Mode Production

```bash

# Build pour la production
ng build --configuration production

# Servir les fichiers de production (avec un serveur web)
npx http-server dist/blog-collaboratif-frontend
```

### Vérification

- **Application** : http://localhost:4200
- **Auto-reload** : L'application se recharge automatiquement lors des modifications
- **Console** : Vérifiez la console pour les erreurs de connexion au backend
- **Notifications** : ⚠️ **IMPORTANT** - Vérifiez le statut d'abonnement aux notifications sur la page d'accueil Home pour recevoir les alertes de commentaires

## 📁 Structure du Projet

```
blog-collaboratif-frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Fonctionnalités principales
│   │   │   ├── guards/              # Protection des routes
│   │   │   │   ├── auth.guard.ts    # Guard d'authentification
│   │   │   │   └── role.guard.ts    # Guard de rôles
│   │   │   ├── interceptors/        # Intercepteurs HTTP
│   │   │   │   └── auth.interceptor.ts # Injection automatique du token
│   │   │   ├── models/              # Modèles TypeScript
│   │   │   │   ├── article.model.ts # Interface Article et AuthorDetails
│   │   │   │   └── comment.model.ts # Interface Comment
│   │   │   └── services/            # Services métier
│   │   │       ├── auth.service.ts       # Authentification et JWT
│   │   │       ├── article.service.ts    # Gestion des articles
│   │   │       ├── comment.service.ts    # Gestion des commentaires
│   │   │       ├── socket.service.ts     # WebSocket temps réel
│   │   │       ├── push-notification.service.ts # Notifications push
│   │   │       ├── stats.service.ts      # Statistiques
│   │   │       └── user.service.ts       # Gestion des utilisateurs
│   │   ├── pages/                   # Pages de l'application
│   │   │   ├── home/                # Page d'accueil
│   │   │   ├── login/               # Connexion
│   │   │   ├── register/            # Inscription
│   │   │   └── dashboard/           # Dashboards par rôle
│   │   │       ├── admin-dashboard/      # Dashboard administrateur
│   │   │       │   └── stats-dashboard/  # Statistiques avec Chart.js
│   │   │       ├── editor-dashboard/     # Dashboard éditeur
│   │   │       ├── redacteur-dashboard/  # Dashboard rédacteur
│   │   │       └── lecteur-dashboard/    # Dashboard lecteur
│   │   ├── shared/                  # Composants partagés
│   │   │   ├── components/          # Composants réutilisables
│   │   │   │   ├── comment-section/ # Section commentaires
│   │   │   │   ├── notification-bell/ # Cloche notifications
│   │   │   │   └── notification-settings/ # Paramètres notifications
│   │   │   ├── navbar/              # Barre de navigation
│   │   │   └── shared.module.ts     # Module partagé
│   │   ├── app-routing.module.ts    # Configuration des routes
│   │   ├── app.component.ts         # Composant racine
│   │   └── app.module.ts           # Module principal
│   ├── assets/                      # Ressources statiques
│   │   ├── icons/                   # Icônes SVG
│   │   └── sw.js                   # Service Worker
│   ├── styles.css                  # Styles globaux
│   └── index.html                  # Page HTML principale
├── angular.json                    # Configuration Angular
├── package.json                   # Dépendances et scripts
└── tsconfig.json                  # Configuration TypeScript
```

## 🏗️ Architecture et Choix Techniques

### Framework et Technologies

#### Frontend Core
- **Angular 16** : Framework TypeScript pour applications web robustes
- **TypeScript 5.0** : Typage statique et fonctionnalités modernes ES2022
- **RxJS 7.8** : Programmation réactive pour la gestion des données asynchrones
- **Angular Router** : Navigation SPA avec guards et protection des routes

#### Interface Utilisateur
- **Bootstrap 5.3** : Framework CSS responsive et moderne
- **Chart.js 4.5** : Bibliothèque de graphiques interactifs
- **ng2-charts 5.0** : Intégration Angular pour Chart.js
- **CSS Custom** : Styles personnalisés avec dégradés modernes

#### Communication et Temps Réel
- **Socket.io-client 4.8** : Communication temps réel avec le backend
- **Angular HttpClient** : Requêtes HTTP avec intercepteurs
- **Web Push API** : Notifications push navigateur

### Architecture Modulaire

#### Core Module Pattern
Le projet utilise une architecture modulaire avec :

1. **Core Module** : Services singleton et fonctionnalités principales
2. **Shared Module** : Composants réutilisables
3. **Feature Modules** : Modules par fonctionnalité (Pages)
4. **Lazy Loading** : Chargement optimisé des modules

#### Services et Injection de Dépendances

```typescript
// Exemple : Service d'authentification
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5001/api/auth';
  
  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }
  
  getUserRole(): string | null {
    // Décodage JWT côté client
  }
}
```

### Gestion de l'Authentification et Autorisation

#### JWT Token Management
- **Storage** : SessionStorage pour la session courante
- **Décodage** : Extraction des informations utilisateur du payload JWT
- **Auto-logout** : Nettoyage automatique en cas d'expiration

#### Guards et Protection des Routes
```typescript
// Routes protégées par rôle
{
  path: 'dashboard/admin',
  component: AdminDashboardComponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['Admin'] }
}
```

#### Rôles Utilisateur
- **Admin** : Accès complet, gestion des roles utilisateurs, statistiques, creation modification et suprimer les articles
- **Editeur** :  Création et modification d'articles, Lecture, commentaires, likes
- **Redacteur** : Création et modification que ses articles
- **Lecteur** : Creation d'articles, Lecture, commentaires, likes

### Composants et Fonctionnalités

#### Dashboards Personnalisés
Chaque rôle dispose d'un dashboard adapté :

1. **Admin Dashboard**
   - Gestion des utilisateurs
   - Statistiques avancées avec Chart.js
   - Cratin, EDit, suppression des articles
   - Modération globale

2. **Editor Dashboard**
   - Creation des articles
   - Editer des articles
   - commenter, liker un article
   

3. **Redacteur Dashboard**
   - Création d'articles
   - Editer que ses publications
   - commenter, liker un article

4. **Lecteur Dashboard**
   - Creation des articles
   - Lectures des articles
   - commenter, liker un article
   

#### Fonctionnalités Temps Réel

**Socket.io Integration**
- Notifications instantanées
- Mise à jour des likes en temps réel
- Nouveaux commentaires
- Statut de connexion des utilisateurs

**Push Notifications**
- Abonnement aux notifications navigateur
- Notifications personnalisées par rôle
- Gestion des permissions

**⚠️ IMPORTANT - Gestion des Notifications Push :**
Pour recevoir les notifications lorsque quelqu'un commente vos articles, l'utilisateur DOIT s'assurer que :

1. **Statut d'abonnement** : La case "Abonnement" doit afficher "✅ Abonné"
2. **Si "❌ Non abonné"** : L'utilisateur doit cliquer sur "S'abonner"
3. **En cas d'erreur timeout** : Si le message "La demande a pris trop de temps. Vérifiez votre connexion et réessayez." apparaît, cliquez à nouveau sur "S'abonner" - l'abonnement se fera immédiatement au second clic
4. **Permissions navigateur** : Autoriser les notifications dans le navigateur quand demandé

#### Système de Commentaires
- Ajout de commentaires en temps réel
- Hiérarchie des réponses
- Modération selon les rôles
- Interface intuitive

### Modèles de Données TypeScript

#### Article Model
```typescript
export interface Article {
  _id: string;
  title: string;
  content: string;
  image: string;
  tags: string[];
  createdAt: string;
  likeCount?: number;
  userLiked?: boolean;
  authorDetails?: AuthorDetails;
}
```

#### User Interface
```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}
```

### Communication avec le Backend

#### Services HTTP
- **Auth Service** : Connexion au User Service (port 5001)
- **Article Service** : Communication avec Article Service (port 5002)
- **Intercepteur JWT** : Injection automatique du token d'authentification

#### Gestion d'Erreurs
- Intercepteurs pour les erreurs HTTP
- Messages d'erreur utilisateur-friendly
- Retry automatique pour les requêtes critiques

### Optimisations et Performance

#### Build et Bundling
- **Tree Shaking** : Élimination du code non utilisé
- **Code Splitting** : Chargement optimisé par chunks
- **Minification** : Compression automatique en production
- **Source Maps** : Debugging facilité

#### Lazy Loading
- Chargement différé des modules
- Amélioration du temps de chargement initial
- Optimisation de la bande passante

### Responsive Design

#### Bootstrap 5 Integration
- Grid system responsive
- Composants adaptatifs
- Mobile-first approach
- Breakpoints personnalisés

#### Custom Styling
```css
body {
  background: linear-gradient(to right, #667eea, #764ba2);
}
```

## 🔧 Configuration et Scripts

### Scripts NPM Disponibles

```bash
# Développement
npm start              # ng serve (port 4200)
npm run build          # Build de production
npm run watch          # Build en mode watch
npm test              # Tests unitaires avec Karma

# Angular CLI
ng generate component  # Créer un composant
ng generate service    # Créer un service
ng build --prod       # Build optimisé
ng test --watch=false  # Tests en mode CI
```

### Configuration Angular

#### Environment Files
```typescript
// Gestion des environnements
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5001',
  articleApiUrl: 'http://localhost:5002'
};
```

#### TypeScript Configuration
- Strict mode activé
- ES2022 target
- Decorators expérimentaux
- Path mapping pour les imports

### Intégration Continue


## 🚀 Déploiement

### Build de Production

```bash
# Build optimisé
ng build --configuration production

# Vérification des bundles
npx webpack-bundle-analyzer dist/blog-collaboratif-frontend/stats.json
```

### Serveur Web

```bash
# Avec http-server
npx http-server dist/blog-collaboratif-frontend

# Avec nginx (configuration exemple)
server {
  listen 80;
  server_name your-domain.com;
  root /path/to/dist/blog-collaboratif-frontend;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### Variables d'Environnement

Pour la production, configurez :
- URLs du backend de production
- Clés API pour les services externes
- Configuration des notifications push
- Domaines autorisés pour CORS

## 📱 Progressive Web App (PWA)

### Service Worker
- Cache des ressources statiques
- Fonctionnement offline partiel
- Mise à jour automatique de l'application

### Notifications Push
- Support des notifications navigateur
- Intégration avec le backend via VAPID
- Personnalisation par rôle utilisateur

**📋 Guide d'utilisation des Notifications :**

1. **Vérification du statut** : Sur la page d'accueil, vérifiez la section "Status Notifications Recipient"
2. **États possibles :**
   - ✅ **Abonné** : Vous recevrez les notifications
   - ❌ **Non abonné** : Cliquez sur "S'abonner" pour activer
3. **Résolution des problèmes :**
   - Si timeout après le premier clic → Recliquez immédiatement sur "S'abonner"
   - Vérifiez que les permissions navigateur sont accordées
   - Testez avec le bouton "Test Notification"
4. **Types de notifications reçues :**
   - Nouveaux commentaires sur vos articles
   - Likes sur vos publications
   - Mentions dans les commentaires

## 🔒 Sécurité

### Bonnes Pratiques Implémentées

1. **Sanitization** : Nettoyage automatique des inputs
2. **CSRF Protection** : Tokens anti-CSRF
3. **XSS Prevention** : Échappement automatique d'Angular
4. **JWT Validation** : Vérification côté client et serveur
5. **Route Guards** : Protection des pages sensibles
6. **Role-based Access** : Contrôle d'accès granulaire

## 📝 Notes de Développement

### Conventions de Code
- **Naming** : camelCase pour les variables, PascalCase pour les classes
- **Structure** : Un composant par fichier
- **Services** : Injectable avec providedIn: 'root'
- **Modules** : Organisation fonctionnelle

### Debugging
- **Angular DevTools** : Extension browser pour le debugging
- **Console Logs** : Logs structurés pour le développement

### Extensions VS Code Recommandées
- Angular Language Service
- TypeScript Importer
- Prettier Code Formatter
- Angular Snippets
- Auto Rename Tag

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Suivre les conventions Angular Style Guide
4. Écrire des tests pour les nouvelles fonctionnalités
5. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
6. Push vers la branche (`git push origin feature/AmazingFeature`)
7. Ouvrir une Pull Request


