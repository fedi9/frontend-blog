import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { Comment } from '../models/comment.model';

export interface CommentEvent {
  comment: Comment;
  type: 'comment' | 'reply';
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private apiUrl = 'http://localhost:5002';

  // Subjects pour les événements
  private commentAddedSubject = new BehaviorSubject<CommentEvent | null>(null);
  private notificationSubject = new BehaviorSubject<any>(null);

  // Observables publics
  public commentAdded$ = this.commentAddedSubject.asObservable();
  public notification$ = this.notificationSubject.asObservable();

  constructor() {}

  // Connecter au serveur Socket.io
  connect(token: string): void {
    if (this.socket && this.isConnected) {
      return;
    }

    console.log('Connecting to Socket.io with token:', token ? 'Token present' : 'No token');

    this.socket = io(this.apiUrl, {
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.io server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.io server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket.io connection error:', error);
      this.isConnected = false;
    });

    // Écouter les nouveaux commentaires
    this.socket.on('comment_added', (data: CommentEvent) => {
      console.log('✅ comment_added event received in socket service:', data);
      this.commentAddedSubject.next(data);
    });

    // Écouter les notifications
    this.socket.on('notification', (notification: any) => {
      console.log('Notification received:', notification);
      this.notificationSubject.next(notification);
    });

    // Écouter les erreurs de commentaire
    this.socket.on('comment_error', (error: any) => {
      console.error('Comment error received:', error);
    });
  }

  // Déconnecter du serveur
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Rejoindre une room d'article
  joinArticle(articleId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_article', articleId);
      console.log(`Joined article room: ${articleId}`);
    }
  }

  // Quitter une room d'article
  leaveArticle(articleId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_article', articleId);
      console.log(`Left article room: ${articleId}`);
    }
  }

  // Créer un nouveau commentaire
  createComment(articleId: string, content: string, parentCommentId?: string): void {
    console.log('🔧 createComment called with:', { articleId, content, parentCommentId });
    console.log('🔧 Socket connected:', this.isConnected);
    console.log('🔧 Socket object:', this.socket);
    
    if (this.socket && this.isConnected) {
      this.socket.emit('new_comment', {
        articleId,
        content,
        parentCommentId
      });
      console.log('✅ Comment sent to server');
    } else {
      console.error('❌ Socket not connected');
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
} 