
import { Component, OnInit } from '@angular/core';
import { ArticleService } from 'src/app/core/services/article.service';
import { Article } from 'src/app/core/models/article.model';

@Component({
  selector: 'app-redacteur-dashboard',
  templateUrl: './redacteur-dashboard.component.html',
  styleUrls: ['./redacteur-dashboard.component.css']
})
export class RedacteurDashboardComponent {
   articles: Article[] = [];
  loading = true;

  showCreateModal = false;
  showEditModal = false;
  selectedArticleId: string | null = null;

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

  currentUserId: string | null = null;

  constructor(private articleService: ArticleService) {}

  ngOnInit(): void {
    this.loadArticles();
    this.loadCurrentUser();
  }

  loadArticles(): void {
    this.articleService.getAllArticles().subscribe({
      next: (data) => {
        this.articles = data.articles;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des articles :', err);
        this.loading = false;
      }
    });
  }

  loadCurrentUser(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserId = payload.id;
    } catch (e) {
      console.error('Erreur de décodage du token');
    }
  }

  // addArticle(): void {
  //   const payload = {
  //     ...this.newArticle,
  //     tags: this.newArticle.tags.split(',').map(tag => tag.trim())
  //   };

  //   this.articleService.createArticle(payload).subscribe({
  //     next: (created) => {
  //       this.articles.unshift(created);
  //       this.newArticle = { title: '', content: '', image: '', tags: '' };
  //       this.showCreateModal = false;
  //     },
  //     error: (err) => {
  //       console.error("Erreur lors de la création :", err);
  //     }
  //   });
  // }
  addArticle(): void {
  const payload = {
    ...this.newArticle,
    tags: this.newArticle.tags.split(',').map(tag => tag.trim())
  };

  this.articleService.createArticle(payload).subscribe({
    next: () => {
      this.loadArticles(); // 🔄 Recharge avec les bons détails (authorDetails)
      this.showCreateModal = false;
      this.newArticle = { title: '', content: '', image: '', tags: '' };
    },
    error: (err) => {
      console.error('Erreur lors de l’ajout de l’article:', err);
    }
  });
}


  openEditModal(article: Article): void {

    if (article.authorDetails?._id !== this.currentUserId) return;

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
        console.error("Erreur de mise à jour :", err);
      }
    });
  }

}
