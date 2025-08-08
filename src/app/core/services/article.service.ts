import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Article } from '../models/article.model';
import { Observable } from 'rxjs';

export interface PaginatedResponse {
  articles: Article[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SearchParams {
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

export interface LikeStatus {
  userLiked: boolean;
  likeCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private apiUrl = 'http://localhost:5002/api/articles';

  constructor(private http: HttpClient) {}

  getAllArticles(page: number = 1, limit: number = 6, search?: string, tag?: string): Observable<PaginatedResponse> {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    
    if (search && search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    
    if (tag && tag.trim()) {
      url += `&tag=${encodeURIComponent(tag.trim())}`;
    }
    
    return this.http.get<PaginatedResponse>(url);
  }

  createArticle(articleData: any): Observable<Article> {
    return this.http.post<Article>(this.apiUrl, articleData);
  }

  updateArticle(id: string, data: any): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/${id}`, data);
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  likeArticle(articleId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${articleId}/like`, {});
  }

  checkUserLike(articleId: string): Observable<LikeStatus> {
    return this.http.get<LikeStatus>(`${this.apiUrl}/${articleId}/like`);
  }
}
