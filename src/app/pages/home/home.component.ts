import { Component, OnInit } from '@angular/core';
import { ArticleService } from 'src/app/core/services/article.service';
import { Article } from 'src/app/core/models/article.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  articles: Article[] = [];
  loading = true;

  constructor(private articleService: ArticleService) {}

  ngOnInit(): void {
    this.articleService.getAllArticles().subscribe({
      next: (data) => {
        console.log("articles", data);
        this.articles = data.articles; // 🔥 CECI est la correction
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des articles:', err);
        this.loading = false;
      }
    });
  }
}
