import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { Comment } from '../models/comment.model';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export interface CommentEvent {
  comment: Comment;
  type: 'comment' | 'reply';
}

export interface NotificationEvent {
  type: string;
  title: string;
  message: string;
  data?: any;
  createdAt?: Date;
}

export interface ArticleLikeEvent {
  articleId: string;
  likeCount: number;
  userLiked: boolean;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private apiUrl = 'http://localhost:5002';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Subjects pour les événements
  private commentAddedSubject = new BehaviorSubject<CommentEvent | null>(null);
  private notificationSubject = new BehaviorSubject<NotificationEvent | null>(null);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private articleLikedSubject = new BehaviorSubject<ArticleLikeEvent | null>(null);

  // Observables publics
  public commentAdded$ = this.commentAddedSubject.asObservable();
  public notification$ = this.notificationSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public articleLiked$ = this.articleLikedSubject.asObservable();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Connecter au serveur Socket.io
  connect(token: string): void {
    if (this.socket && this.isConnected) {
      console.log('Socket déjà connecté');
      return;
    }

    console.log('🔌 Tentative de connexion Socket.io avec token:', token ? 'Token présent' : 'Pas de token');

    this.socket = io(this.apiUrl, {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log('✅ Connecté au serveur Socket.io');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.connectionStatusSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Déconnecté du serveur Socket.io');
      this.isConnected = false;
      this.connectionStatusSubject.next(false);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('❌ Erreur de connexion Socket.io:', error);
      this.isConnected = false;
      this.connectionStatusSubject.next(false);
      
      // Vérifier si c'est une erreur d'authentification
      if (error.message && error.message.includes('Authentication error')) {
        console.log('🔐 Erreur d\'authentification Socket.io, redirection vers la page de login...');
        // Nettoyer les données de session
        this.authService.logout();
        // Rediriger vers la page de login avec un message
        this.router.navigate(['/login'], { 
          queryParams: { 
            message: 'Votre session a expiré. Veuillez vous reconnecter.' 
          } 
        });
        return;
      }
      
      // Tentative de reconnexion
      this.reconnectAttempts++;
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      }
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`✅ Reconnexion réussie après ${attemptNumber} tentatives`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.connectionStatusSubject.next(true);
    });

    // Écouter les nouveaux commentaires
    this.socket.on('comment_added', (data: CommentEvent) => {
      console.log('💬 Événement comment_added reçu:', data);
      this.commentAddedSubject.next(data);
    });

    // Écouter les likes d'articles
    this.socket.on('article_liked', (data: ArticleLikeEvent) => {
      console.log('👍 Événement article_liked reçu:', data);
      this.articleLikedSubject.next(data);
    });

    // Écouter les notifications
    this.socket.on('notification', (notification: NotificationEvent) => {
      console.log('🔔 Notification reçue:', notification);
      this.notificationSubject.next(notification);
    });

    // Écouter les erreurs de commentaire
    this.socket.on('comment_error', (error: any) => {
      console.error('❌ Erreur de commentaire reçue:', error);
    });
  }

  // Déconnecter du serveur
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Déconnexion du serveur Socket.io');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionStatusSubject.next(false);
    }
  }

  // Rejoindre une room d'article
  joinArticle(articleId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_article', articleId);
      console.log(`📄 Rejoint la room de l'article: ${articleId}`);
    } else {
      console.warn('⚠️ Socket non connecté, impossible de rejoindre la room');
    }
  }

  // Quitter une room d'article
  leaveArticle(articleId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_article', articleId);
      console.log(`📄 Quitté la room de l'article: ${articleId}`);
    }
  }

  // Créer un nouveau commentaire
  createComment(articleId: string, content: string, parentCommentId?: string): void {
    console.log('🔧 createComment appelé avec:', { articleId, content, parentCommentId });
    console.log('🔧 Socket connecté:', this.isConnected);
    
    if (this.socket && this.isConnected) {
      this.socket.emit('new_comment', {
        articleId,
        content,
        parentCommentId
      });
      console.log('✅ Commentaire envoyé au serveur');
    } else {
      console.error('❌ Socket non connecté, impossible d\'envoyer le commentaire');
    }
  }

  // Vérifier si connecté
  isSocketConnected(): boolean {
    return this.isConnected;
  }

  // Obtenir le socket
  getSocket(): Socket | null {
    return this.socket;
  }

  // Obtenir le statut de connexion
  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus$;
  }
} 