import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface ArticleStats {
  totalLikes: number;
  stats: Array<{
    date?: string;
    week?: string;
    month?: string;
    likes: number;
  }>;
  period: string;
}

export interface GlobalStats {
  globalTotals: {
    totalLikes: number;
  };
  topLikedArticles: Array<{
    article: any;
    stats: {
      totalLikes: number;
    };
  }>;
  periodStats: Array<{
    date?: string;
    likes: number;
  }>;
  period: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private readonly API_URL = 'http://localhost:5002/api/stats';

  constructor(private http: HttpClient) {}

  // Obtenir les statistiques de likes d'un article
  getArticleStats(articleId: string, period: string = 'daily', limit: number = 30): Observable<ArticleStats> {
    return this.http.get<ApiResponse<ArticleStats>>(`${this.API_URL}/article/${articleId}?period=${period}&limit=${limit}`)
      .pipe(map(response => response.data));
  }

  // Obtenir les statistiques globales de likes (Admin seulement)
  getGlobalStats(period: string = 'daily', limit: number = 30): Observable<GlobalStats> {
    return this.http.get<ApiResponse<GlobalStats>>(`${this.API_URL}/global?period=${period}&limit=${limit}`)
      .pipe(map(response => response.data));
  }
} 