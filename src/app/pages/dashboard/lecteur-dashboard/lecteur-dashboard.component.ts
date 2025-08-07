
import { Component, OnInit } from '@angular/core';
import { ArticleService } from 'src/app/core/services/article.service';
import { Article } from 'src/app/core/models/article.model';

@Component({
  selector: 'app-lecteur-dashboard',
  templateUrl: './lecteur-dashboard.component.html',
  styleUrls: ['./lecteur-dashboard.component.css']
})
export class LecteurDashboardComponent {
    articles: Article[] = [];
  loading = true;

  showCreateModal = false;

  newArticle = {
    title: '',
    content: '',
    image: '',
    tags: ''
  };

  constructor(private articleService: ArticleService) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.articleService.getAllArticles().subscribe({
      next: (data) => {
        this.articles = data.articles;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des articles:', err);
        this.loading = false;
      }
    });
  }

  addArticle(): void {
    const payload = {
      ...this.newArticle,
      tags: this.newArticle.tags.split(',').map(tag => tag.trim())
    };

    this.articleService.createArticle(payload).subscribe({
      next: (created) => {
        this.articles.unshift(created);
        this.newArticle = { title: '', content: '', image: '', tags: '' };
        this.showCreateModal = false;
      },
      error: (err) => {
        console.error('Erreur lors de l’ajout de l’article:', err);
      }
    });
  }

}
