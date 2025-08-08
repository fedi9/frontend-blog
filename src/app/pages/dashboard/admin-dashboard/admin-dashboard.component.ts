import { Component, OnInit } from '@angular/core';
import { ArticleService, PaginatedResponse } from 'src/app/core/services/article.service';
import { UserService, User, PaginatedUserResponse } from 'src/app/core/services/user.service';
import { Article } from 'src/app/core/models/article.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  articles: Article[] = [];
  loading = true;

  
  currentPage = 1;
  totalPages = 1;
  totalArticles = 0;
  articlesPerPage = 8;

  
  searchTerm = '';
  selectedTag = '';
  availableTags: string[] = [];

 
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;

 
  newArticle = {
    title: '',
    content: '',
    image: '',
    tags: ''
  };

 
  selectedArticle: Article | null = null;
  editForm = {
    title: '',
    content: '',
    image: '',
    tags: ''
  };


  users: User[] = [];
  usersLoading = true;


  userCurrentPage = 1;
  userTotalPages = 1;
  totalUsers = 0;
  usersPerPage = 8;

 
  userSearchTerm = '';
  selectedUserRole = '';


  showEditUserModal = false;
  
  selectedUser: User | null = null;
  newUserRole = '';

  constructor(
    private articleService: ArticleService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadArticles();
    this.loadAvailableTags();
    this.loadUsers();
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
        console.error('Erreur lors du chargement des articles :', err);
        this.loading = false;
      }
    });
  }

  loadUsers(page: number = 1): void {
    this.usersLoading = true;
    this.userCurrentPage = page;
    
    this.userService.getAllUsers(page, this.usersPerPage, this.userSearchTerm, this.selectedUserRole).subscribe({
      next: (data: PaginatedUserResponse) => {
        this.users = data.users;
        this.userTotalPages = data.totalPages;
        this.totalUsers = data.total;
        this.usersLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs :', err);
        this.usersLoading = false;
      }
    });
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

  // Search methods
  onSearch(): void {
    this.currentPage = 1; 
    this.loadArticles();
  }

  onTagChange(): void {
    this.currentPage = 1;
    this.loadArticles();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedTag = '';
    this.currentPage = 1;
    this.loadArticles();
  }

  // User search methods
  onUserSearch(): void {
    this.userCurrentPage = 1;
    this.loadUsers();
  }

  onUserRoleChange(): void {
    this.userCurrentPage = 1;
    this.loadUsers();
  }

  clearUserSearch(): void {
    this.userSearchTerm = '';
    this.selectedUserRole = '';
    this.userCurrentPage = 1;
    this.loadUsers();
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

  // User pagination methods
  goToUserPage(page: number): void {
    if (page >= 1 && page <= this.userTotalPages) {
      this.loadUsers(page);
    }
  }

  nextUserPage(): void {
    if (this.userCurrentPage < this.userTotalPages) {
      this.goToUserPage(this.userCurrentPage + 1);
    }
  }

  previousUserPage(): void {
    if (this.userCurrentPage > 1) {
      this.goToUserPage(this.userCurrentPage - 1);
    }
  }

  getUserPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.userCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.userTotalPages, startPage + maxVisiblePages - 1);
    
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
        this.loadArticles(1); 
        this.loadAvailableTags(); 
        this.showCreateModal = false;
        this.newArticle = { title: '', content: '', image: '', tags: '' };
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout de l\'article:', err);
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
      next: () => {
        this.loadArticles(this.currentPage); 
        this.showEditModal = false;
        this.selectedArticle = null;
      },
      error: (err) => {
        console.error("Erreur de mise à jour :", err);
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
        this.loadArticles(this.currentPage); 
        this.selectedArticle = null;
        this.showDeleteModal = false;
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
      }
    });
  }

  // User management methods
  openEditUserModal(user: User): void {
    this.selectedUser = user;
    this.newUserRole = user.role; 
    this.showEditUserModal = true;
  }

  updateUserRole(): void {
    if (!this.selectedUser || !this.newUserRole) return;

    const username = this.selectedUser.username; 

    this.userService.updateUserRole(this.selectedUser._id, this.newUserRole).subscribe({
      next: (response) => {
        console.log('Rôle modifié avec succès:', response.message);
      
        this.loadUsers(this.userCurrentPage);
        this.showEditUserModal = false;
        this.selectedUser = null;
        this.newUserRole = '';
        
     
        alert(`Rôle de ${username} modifié avec succès !`);
      },
      error: (err) => {
        console.error('Erreur lors de la modification du rôle:', err);
        alert('Erreur lors de la modification du rôle: ' + (err.error?.message || err.message));
      }
    });
  }

  // openDeleteUserModal(user: User): void {
  //   this.selectedUser = user;
  //   this.showDeleteUserModal = true;
  // }

  // deleteUser(): void {
  //   if (!this.selectedUser) return;

  //   const username = this.selectedUser.username; // Stocker le nom avant de le supprimer

  //   this.userService.deleteUser(this.selectedUser._id).subscribe({
  //     next: () => {
  //       console.log('Utilisateur supprimé avec succès');
  //       // Recharger la liste des utilisateurs
  //       this.loadUsers(this.userCurrentPage);
  //       this.showDeleteUserModal = false;
  //       this.selectedUser = null;
        
  //       // Afficher un message de succès
  //       alert(`Utilisateur ${username} supprimé avec succès !`);
  //     },
  //     error: (err) => {
  //       console.error('Erreur lors de la suppression:', err);
  //       alert('Erreur lors de la suppression: ' + (err.error?.message || err.message));
  //     }
  //   });
  // }
}
