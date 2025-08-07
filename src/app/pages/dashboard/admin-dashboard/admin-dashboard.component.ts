import { Component, OnInit } from '@angular/core';
import { ArticleService } from 'src/app/core/services/article.service';
import { Article } from 'src/app/core/models/article.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {

  articles: Article[] = [];
  loading = true;

  // Popups
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;

  // Nouvel article
  newArticle = {
    title: '',
    content: '',
    image: '',
    tags: ''
  };

  // Edition
  selectedArticle: Article | null = null;
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
    this.loading = true;
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
        console.error('Erreur lors de la création de l’article:', err);
      }
    });
  }

  openEditModal(article: Article): void {
    this.selectedArticle = article;
    this.editForm = {
      title: article.title,
      content: article.content,
      image: article.image,
      tags: article.tags.join(', ')
    };
    this.showEditModal = true;
  }

  updateArticle(): void {
    if (!this.selectedArticle) return;

    const updated = {
      ...this.editForm,
      tags: this.editForm.tags.split(',').map(tag => tag.trim())
    };

    this.articleService.updateArticle(this.selectedArticle._id, updated).subscribe({
      next: (res) => {
        this.loadArticles();
        this.showEditModal = false;
        this.selectedArticle = null;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour:', err);
      }
    });
  }

  openDeleteModal(article: Article): void {
    this.selectedArticle = article;
    this.showDeleteModal = true;
  }

  deleteArticle(): void {
    if (!this.selectedArticle) return;

    this.articleService.deleteArticle(this.selectedArticle._id).subscribe({
      next: () => {
        this.articles = this.articles.filter(a => a._id !== this.selectedArticle?._id);
        this.selectedArticle = null;
        this.showDeleteModal = false;
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
      }
    });
  }
}
