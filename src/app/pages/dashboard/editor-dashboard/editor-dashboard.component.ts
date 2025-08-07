import { Component, OnInit } from '@angular/core';
import { ArticleService } from 'src/app/core/services/article.service';
import { Article } from 'src/app/core/models/article.model';

@Component({
  selector: 'app-editor-dashboard',
  templateUrl: './editor-dashboard.component.html'
})
export class EditorDashboardComponent implements OnInit {

  articles: Article[] = [];
  loading = true;

  // Popups
  showCreateModal = false;
  showEditModal = false;
  selectedArticleId: string | null = null;

  // Formulaires
  newArticle = {
    title: '',
    content: '',
    image: '',
    tags: ''
  };

  editForm = {
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
        this.articles.unshift(created); // Ajouter en haut
        this.newArticle = { title: '', content: '', image: '', tags: '' };
        this.showCreateModal = false;
      },
      error: (err) => {
        console.error('Erreur lors de l’ajout de l’article:', err);
      }
    });
  }

  openEditModal(article: Article): void {
    this.selectedArticleId = article._id;
    this.editForm = {
      title: article.title,
      content: article.content,
      image: article.image,
      tags: article.tags.join(', ')
    };
    this.showEditModal = true;
  }

  updateArticle(): void {
    if (!this.selectedArticleId) return;

    const updated = {
      ...this.editForm,
      tags: this.editForm.tags.split(',').map(tag => tag.trim())
    };

    this.articleService.updateArticle(this.selectedArticleId, updated).subscribe({
      next: () => {
        this.loadArticles();
        this.showEditModal = false;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour:', err);
      }
    });
  }
}
