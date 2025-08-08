import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, CommentResponse, CreateCommentRequest, CommentLikeResponse } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:5002/api/comments';

  constructor(private http: HttpClient) {}

  // Obtenir tous les commentaires d'un article
  getCommentsByArticle(articleId: string, page: number = 1, limit: number = 10): Observable<CommentResponse> {
    return this.http.get<CommentResponse>(`${this.apiUrl}/article/${articleId}?page=${page}&limit=${limit}`);
  }

  // Créer un nouveau commentaire
  createComment(commentData: CreateCommentRequest): Observable<{ message: string; comment: Comment }> {
    return this.http.post<{ message: string; comment: Comment }>(this.apiUrl, commentData);
  }

  // Mettre à jour un commentaire
  updateComment(commentId: string, content: string): Observable<{ message: string; comment: Comment }> {
    return this.http.put<{ message: string; comment: Comment }>(`${this.apiUrl}/${commentId}`, { content });
  }

  // Supprimer un commentaire
  deleteComment(commentId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${commentId}`);
  }

  // Liker/unliker un commentaire
  toggleLike(commentId: string): Observable<CommentLikeResponse> {
    return this.http.post<CommentLikeResponse>(`${this.apiUrl}/${commentId}/like`, {});
  }

  // Obtenir les réponses d'un commentaire
  getReplies(commentId: string, page: number = 1, limit: number = 10): Observable<CommentResponse> {
    return this.http.get<CommentResponse>(`${this.apiUrl}/${commentId}/replies?page=${page}&limit=${limit}`);
  }
} 