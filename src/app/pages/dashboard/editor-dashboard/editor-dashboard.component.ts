import { Component, OnInit } from '@angular/core';
import { ArticleService, PaginatedResponse } from 'src/app/core/services/article.service';
import { Article } from 'src/app/core/models/article.model';

@Component({
  selector: 'app-editor-dashboard',
  templateUrl: './editor-dashboard.component.html',
  styleUrls: ['./editor-dashboard.component.css']
})
export class EditorDashboardComponent implements OnInit {
  articles: Article[] = [];
  loading = true;

  // Pagination properties
  currentPage = 1;
  totalPages = 1;
  totalArticles = 0;
  articlesPerPage = 8; // 8 articles par page

  // Search properties
  searchTerm = '';
  selectedTag = '';
  availableTags: string[] = [];

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
    this.loadAvailableTags();
  }

  loadArticles(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;
    
    this.articleService.getAllArticles(page, this.articlesPerPage, this.searchTerm, this.selectedTag).subscribe({
      next: (data: PaginatedResponse) => {
        this.articles = data.articles;
        this.totalPages = data.totalPages;
        this.totalArticles = data.total;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des articles:', err);
        this.loading = false;
      }
    });
  }

  // Search methods
  onSearch(): void {
    this.currentPage = 1; // Retour à la première page lors d'une recherche
    this.loadArticles();
  }

  onTagChange(): void {
    this.currentPage = 1; // Retour à la première page lors d'un changement de tag
    this.loadArticles();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedTag = '';
    this.currentPage = 1;
    this.loadArticles();
  }

  loadAvailableTags(): void {
    // Charger tous les articles pour extraire les tags uniques
    this.articleService.getAllArticles(1, 1000).subscribe({
      next: (data: PaginatedResponse) => {
        const allTags = data.articles.flatMap(article => article.tags);
        this.availableTags = [...new Set(allTags)].sort();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des tags:', err);
      }
    });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadArticles(page);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  addArticle(): void {
    const payload = {
      ...this.newArticle,
      tags: this.newArticle.tags.split(',').map(tag => tag.trim())
    };

    this.articleService.createArticle(payload).subscribe({
      next: () => {
        this.loadArticles(1); // Retour à la première page après création
        this.loadAvailableTags(); // Recharger les tags disponibles
        this.newArticle = { title: '', content: '', image: '', tags: '' };
        this.showCreateModal = false;
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout de l\'article:', err);
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
        this.loadArticles(this.currentPage); // Garder la page actuelle après modification
        this.showEditModal = false;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour:', err);
      }
    });
  }
}
