import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Article } from '../models/article.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private apiUrl = 'http://localhost:5002/api/articles';

  constructor(private http: HttpClient) {}

  // getAllArticles(): Observable<Article[]> {
  //   return this.http.get<Article[]>(this.apiUrl);
  // }
  getAllArticles(): Observable<{ articles: Article[] }> {
  return this.http.get<{ articles: Article[] }>(`${this.apiUrl}`);
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



}
