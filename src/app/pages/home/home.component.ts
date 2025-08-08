import { Component, OnInit, OnDestroy } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ArticleService, PaginatedResponse } from 'src/app/core/services/article.service';
import { Article } from 'src/app/core/models/article.model';
import { PushNotificationService } from '../../core/services/push-notification.service';
import { SocketService, ArticleLikeEvent } from '../../core/services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  articles: Article[] = [];
  loading = true;

 
  currentPage = 1;
  totalPages = 1;
  totalArticles = 0;
  articlesPerPage = 8;

 
  searchTerm = '';
  selectedTag = '';
  availableTags: string[] = [];

  
  isSubscribed = false;
  isLoading = false;
  isSupported = false;
  permissionStatus: NotificationPermission = 'default';
  notificationMessage = '';
  notificationMessageClass = '';

  
  private socketSubscription = new Subscription();

  constructor(
    private articleService: ArticleService,
    private pushNotificationService: PushNotificationService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.loadArticles();
    this.loadAvailableTags();
    this.initializeNotifications();
    this.setupSocketListeners();
  }

  ngOnDestroy(): void {
    this.socketSubscription.unsubscribe();
  }

  private setupSocketListeners(): void {
    // Se connecter au Socket.io si pas déjà connecté
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token && !this.socketService.isSocketConnected()) {
      this.socketService.connect(token);
    }

    // Écouter les événements de likes d'articles
    this.socketSubscription.add(
      this.socketService.articleLiked$.subscribe((event: ArticleLikeEvent | null) => {
        if (event) {
          console.log('👍 Événement de like reçu:', event);
          this.updateArticleLike(event);
        }
      })
    );

    // Écouter les erreurs de connexion Socket.io
    this.socketSubscription.add(
      this.socketService.connectionStatus$.subscribe((isConnected: boolean) => {
        if (!isConnected) {
          console.log('🔌 Socket.io déconnecté');
        }
      })
    );
  }

  private updateArticleLike(event: ArticleLikeEvent): void {
    const article = this.articles.find(a => a._id === event.articleId);
    if (article) {
      article.likeCount = event.likeCount;
      // Mettre à jour userLiked seulement si c'est l'utilisateur actuel
      if (event.userId === this.getCurrentUserId()) {
        article.userLiked = event.userLiked;
      }
      console.log(`👍 Article ${event.articleId} mis à jour: ${event.likeCount} likes`);
    }
  }

  private getCurrentUserId(): string | null {
    // Récupérer l'ID de l'utilisateur actuel depuis sessionStorage
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || user._id;
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur:', error);
      }
    }
    return null;
  }

  loadArticles(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;
    
    this.articleService.getAllArticles(page, this.articlesPerPage, this.searchTerm, this.selectedTag).subscribe({
      next: (data: PaginatedResponse) => {
        this.articles = data.articles;
        this.totalPages = data.totalPages;
        this.totalArticles = data.total;
        this.loading = false;
        
        // Charger le statut de like pour chaque article
        this.loadLikeStatusForArticles();
        
        // Rejoindre les rooms Socket.io pour chaque article
        this.joinArticleRooms();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des articles :', err);
        this.loading = false;
      }
    });
  }

  private joinArticleRooms(): void {
    
    this.articles.forEach(article => {
      this.socketService.joinArticle(article._id);
    });
  }

  loadAvailableTags(): void {
  
    this.articleService.getAllArticles(1, 1000).subscribe({
      next: (data: PaginatedResponse) => {
        const allTags = data.articles.flatMap(article => article.tags);
        this.availableTags = [...new Set(allTags)].sort();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tags:', err);
      }
    });
  }


  private loadLikeStatusForArticles(): void {
    this.articles.forEach(article => {
      this.articleService.checkUserLike(article._id).subscribe({
        next: (likeStatus) => {
          article.userLiked = likeStatus.userLiked;
          article.likeCount = likeStatus.likeCount;
        },
        error: (error) => {
          console.error('Erreur lors du chargement du statut de like:', error);
        
          article.userLiked = false;
          article.likeCount = article.likeCount || 0;
        }
      });
    });
  }

  // Search methods
  onSearch(): void {
    this.currentPage = 1; 
    this.loadArticles();
  }

  onTagChange(): void {
    this.currentPage = 1; 
    this.loadArticles();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedTag = '';
    this.currentPage = 1;
    this.loadArticles();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadArticles(page);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Notification methods
  private async initializeNotifications(): Promise<void> {
    await this.checkSupport();
    await this.checkSubscriptionStatus();
    await this.checkPermissionStatus();
  }

  private async checkSupport(): Promise<void> {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  private async checkSubscriptionStatus(): Promise<void> {
    if (!this.isSupported) return;
    
    try {
      this.isSubscribed = await this.pushNotificationService.isSubscribed();
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
    }
  }

  private async checkPermissionStatus(): Promise<void> {
    if (!this.isSupported) return;
    this.permissionStatus = Notification.permission;
  }

  async subscribeToNotifications(): Promise<void> {
    if (!this.isSupported) {
      this.showNotificationMessage('Les notifications push ne sont pas supportées par votre navigateur.', 'danger');
      return;
    }

    this.isLoading = true;
    
    try {
      // Timeout de 10 secondes pour éviter les blocages
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La demande a pris trop de temps')), 10000);
      });

      const subscriptionPromise = this.pushNotificationService.subscribeToPushNotifications();
      
      const subscription = await Promise.race([subscriptionPromise, timeoutPromise]) as any;
      
      if (subscription) {
        this.isSubscribed = true;
        this.permissionStatus = 'granted';
        this.showNotificationMessage('✅ Vous êtes maintenant abonné aux notifications push !', 'success');
      } else {
        this.showNotificationMessage('❌ Impossible de s\'abonner aux notifications. Veuillez réessayer.', 'danger');
      }
    } catch (error) {
      console.error('Erreur lors de l\'abonnement:', error);
      let errorMessage = 'Erreur lors de l\'abonnement aux notifications';
      
      if (error instanceof Error) {
        if (error.message.includes('Timeout')) {
          errorMessage = 'La demande a pris trop de temps. Vérifiez votre connexion et réessayez.';
        } else if (error.message.includes('Permission')) {
          errorMessage = 'Permission refusée. Veuillez autoriser les notifications dans votre navigateur.';
        } else {
          errorMessage = error.message;
        }
      }
      
      this.showNotificationMessage('❌ ' + errorMessage, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async unsubscribeFromNotifications(): Promise<void> {
    if (!this.isSupported) return;

    this.isLoading = true;
    
    try {
      const success = await this.pushNotificationService.unsubscribeFromPushNotifications();
      
      if (success) {
        this.isSubscribed = false;
        this.showNotificationMessage('✅ Désabonnement réussi', 'success');
      } else {
        this.showNotificationMessage('❌ Erreur lors du désabonnement', 'danger');
      }
    } catch (error) {
      console.error('Erreur lors du désabonnement:', error);
      this.showNotificationMessage('❌ Erreur lors du désabonnement: ' + error, 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async testNotification(): Promise<void> {
    if (!this.isSupported) {
      this.showNotificationMessage('Les notifications ne sont pas supportées par votre navigateur.', 'danger');
      return;
    }

    try {
      await firstValueFrom(this.pushNotificationService.testNotification('Test', 'Ceci est un test de notification !'));
      this.showNotificationMessage('✅ Notification de test envoyée !', 'success');
    } catch (error) {
      console.error('Erreur lors du test:', error);
      this.showNotificationMessage('❌ Erreur lors du test de notification: ' + error, 'danger');
    }
  }

  getPermissionText(): string {
    switch (this.permissionStatus) {
      case 'granted': return '✅ Accordées';
      case 'denied': return '❌ Refusées';
      default: return '⏳ En attente';
    }
  }

  getPermissionClass(): string {
    switch (this.permissionStatus) {
      case 'granted': return 'text-success';
      case 'denied': return 'text-danger';
      default: return 'text-warning';
    }
  }

  // Méthode pour liker/unliker un article
  likeArticle(articleId: string): void {
    const article = this.articles.find(a => a._id === articleId);
    if (!article) return;

    
    article.liking = true;

    // Faire l'action de like/unlike directement
    this.articleService.likeArticle(articleId).subscribe({
      next: (response) => {
        // Mettre à jour le compteur de likes et l'état de l'utilisateur
        article.likeCount = response.likeCount;
        article.userLiked = response.userLiked;
        article.liking = false;
        console.log('Article like/unlike avec succès:', response);
      },
      error: (error) => {
        console.error('Erreur lors du like/unlike:', error);
        article.liking = false;
      }
    });
  }

  private showNotificationMessage(text: string, type: 'success' | 'danger' | 'info'): void {
    this.notificationMessage = text;
    this.notificationMessageClass = `alert-${type}`;
    setTimeout(() => {
      this.notificationMessage = '';
      this.notificationMessageClass = '';
    }, 5000);
  }
}
