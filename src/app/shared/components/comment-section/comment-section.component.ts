import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment, CommentResponse } from '../../../core/models/comment.model';
import { CommentService } from '../../../core/services/comment.service';
import { SocketService, CommentEvent } from '../../../core/services/socket.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.css']
})
export class CommentSectionComponent implements OnInit, OnDestroy {
  @Input() articleId!: string;
  
  comments: Comment[] = [];
  loading = false;
  submitting = false;
  currentPage = 1;
  totalPages = 1;
  totalComments = 0;
  
  commentForm: FormGroup;
  replyForm: FormGroup;
  replyingTo: Comment | null = null;
  
  private subscriptions = new Subscription();
  currentUser: User | null = null;

  constructor(
    private commentService: CommentService,
    private socketService: SocketService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
    
    this.replyForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadComments();
    this.setupSocketListeners();
    
    // Connecter au Socket.io si l'utilisateur est connecté
    if (this.currentUser) {
      const token = localStorage.getItem('token');
      if (token) {
        this.socketService.connect(token);
        this.socketService.joinArticle(this.articleId);
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.socketService.leaveArticle(this.articleId);
    this.socketService.disconnect();
  }

  private setupSocketListeners(): void {
    // Écouter les nouveaux commentaires
    this.subscriptions.add(
      this.socketService.commentAdded$.subscribe((event: CommentEvent | null) => {
        console.log('Socket event received:', event);
        console.log('Event structure:', JSON.stringify(event, null, 2));
        console.log('Current articleId:', this.articleId);
        console.log('Event article:', event?.comment?.article);
        console.log('Article match:', event?.comment?.article === this.articleId);
        
        if (event && event.comment.article === this.articleId) {
          console.log('Adding comment to list:', event.comment);
          
          // Vérifier si c'est un commentaire temporaire à remplacer
          if (event.comment.parentComment) {
            // C'est une réponse
            const parentComment = this.comments.find(c => c._id === event.comment.parentComment);
            if (parentComment && parentComment.replies) {
              // Chercher une réponse temporaire à remplacer
              const tempIndex = parentComment.replies.findIndex(r => r._id.startsWith('temp_reply_'));
              if (tempIndex !== -1) {
                parentComment.replies[tempIndex] = event.comment;
              } else {
                parentComment.replies.unshift(event.comment);
              }
            }
          } else {
            // C'est un commentaire parent
            const tempIndex = this.comments.findIndex(c => c._id.startsWith('temp_') && !c._id.startsWith('temp_reply_'));
            if (tempIndex !== -1) {
              this.comments[tempIndex] = event.comment;
            } else {
              this.comments.unshift(event.comment);
            }
          }
        } else {
          console.log('Event ignored - article mismatch or null event');
        }
      })
    );
  }

  private loadComments(): void {
    this.loading = true;
    this.subscriptions.add(
      this.commentService.getCommentsByArticle(this.articleId, this.currentPage).subscribe({
        next: (response: CommentResponse) => {
          this.comments = response.comments;
          this.currentPage = response.currentPage;
          this.totalPages = response.totalPages;
          this.totalComments = response.totalComments;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading comments:', error);
          this.loading = false;
        }
      })
    );
  }

  private addCommentToList(comment: Comment): void {
    // S'assurer que le commentaire a la structure complète
    const completeComment: Comment = {
      ...comment,
      author: comment.author || {
        _id: this.currentUser?.id || '',
        username: this.currentUser?.username || '',
        email: this.currentUser?.email || ''
      },
      authorName: comment.authorName || this.currentUser?.username || 'Utilisateur',
      likes: comment.likes || [],
      replies: comment.replies || [],
      createdAt: comment.createdAt || new Date(),
      updatedAt: comment.updatedAt || new Date()
    };

    if (comment.parentComment) {
      // C'est une réponse, l'ajouter au commentaire parent
      const parentComment = this.comments.find(c => c._id === comment.parentComment);
      if (parentComment) {
        if (!parentComment.replies) {
          parentComment.replies = [];
        }
        parentComment.replies.unshift(completeComment);
      }
    } else {
      // C'est un commentaire parent, l'ajouter au début de la liste
      this.comments.unshift(completeComment);
    }
  }

  onSubmitComment(): void {
    if (this.commentForm.valid && !this.submitting) {
      this.submitting = true;
      const content = this.commentForm.get('content')?.value;
      
      // Créer un commentaire temporaire pour affichage immédiat
      const tempComment: Comment = {
        _id: 'temp_' + Date.now(),
        article: this.articleId,
        author: {
          _id: this.currentUser?.id || '',
          username: this.currentUser?.username || '',
          email: this.currentUser?.email || ''
        },
        authorName: this.currentUser?.username || 'Utilisateur',
        content: content,
        likes: [],
        replies: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Ajouter le commentaire temporaire immédiatement
      this.comments.unshift(tempComment);
      
      if (this.socketService.isSocketConnected()) {
        // Utiliser Socket.io pour la création en temps réel
        this.socketService.createComment(this.articleId, content);
        this.commentForm.reset();
        this.submitting = false;
      } else {
        // Fallback vers l'API REST
        this.subscriptions.add(
          this.commentService.createComment({
            articleId: this.articleId,
            content: content
          }).subscribe({
            next: (response) => {
              // Remplacer le commentaire temporaire par le vrai commentaire
              const tempIndex = this.comments.findIndex(c => c._id === tempComment._id);
              if (tempIndex !== -1) {
                this.comments[tempIndex] = response.comment;
              }
              this.commentForm.reset();
              this.submitting = false;
            },
            error: (error) => {
              console.error('Error creating comment:', error);
              // Retirer le commentaire temporaire en cas d'erreur
              const tempIndex = this.comments.findIndex(c => c._id === tempComment._id);
              if (tempIndex !== -1) {
                this.comments.splice(tempIndex, 1);
              }
              this.submitting = false;
            }
          })
        );
      }
    }
  }

  onSubmitReply(): void {
    if (this.replyForm.valid && this.replyingTo && !this.submitting) {
      this.submitting = true;
      const content = this.replyForm.get('content')?.value;
      
      // Créer une réponse temporaire pour affichage immédiat
      const tempReply: Comment = {
        _id: 'temp_reply_' + Date.now(),
        article: this.articleId,
        author: {
          _id: this.currentUser?.id || '',
          username: this.currentUser?.username || '',
          email: this.currentUser?.email || ''
        },
        authorName: this.currentUser?.username || 'Utilisateur',
        content: content,
        parentComment: this.replyingTo._id,
        likes: [],
        replies: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Ajouter la réponse temporaire immédiatement
      if (!this.replyingTo.replies) {
        this.replyingTo.replies = [];
      }
      this.replyingTo.replies.unshift(tempReply);
      
      if (this.socketService.isSocketConnected()) {
        // Utiliser Socket.io pour la création en temps réel
        this.socketService.createComment(this.articleId, content, this.replyingTo._id);
        this.replyForm.reset();
        this.replyingTo = null;
        this.submitting = false;
      } else {
        // Fallback vers l'API REST
        this.subscriptions.add(
          this.commentService.createComment({
            articleId: this.articleId,
            content: content,
            parentCommentId: this.replyingTo._id
          }).subscribe({
            next: (response) => {
              // Remplacer la réponse temporaire par la vraie réponse
              const parentComment = this.comments.find(c => c._id === this.replyingTo?._id);
              if (parentComment && parentComment.replies) {
                const tempIndex = parentComment.replies.findIndex(r => r._id === tempReply._id);
                if (tempIndex !== -1) {
                  parentComment.replies[tempIndex] = response.comment;
                }
              }
              this.replyForm.reset();
              this.replyingTo = null;
              this.submitting = false;
            },
            error: (error) => {
              console.error('Error creating reply:', error);
              // Retirer la réponse temporaire en cas d'erreur
              const parentComment = this.comments.find(c => c._id === this.replyingTo?._id);
              if (parentComment && parentComment.replies) {
                const tempIndex = parentComment.replies.findIndex(r => r._id === tempReply._id);
                if (tempIndex !== -1) {
                  parentComment.replies.splice(tempIndex, 1);
                }
              }
              this.submitting = false;
            }
          })
        );
      }
    }
  }

  startReply(comment: Comment): void {
    this.replyingTo = comment;
  }

  cancelReply(): void {
    this.replyingTo = null;
    this.replyForm.reset();
  }

  toggleLike(comment: Comment): void {
    if (this.currentUser) {
      this.subscriptions.add(
        this.commentService.toggleLike(comment._id).subscribe({
          next: (response) => {
            // Mettre à jour le commentaire dans la liste
            const index = this.comments.findIndex(c => c._id === comment._id);
            if (index !== -1) {
              this.comments[index] = response.comment;
            }
          },
          error: (error) => {
            console.error('Error toggling like:', error);
          }
        })
      );
    }
  }

  isLikedByUser(comment: Comment): boolean {
    if (!this.currentUser || !comment.likes) return false;
    return comment.likes.includes(this.currentUser.id);
  }

  loadMoreComments(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadComments();
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 