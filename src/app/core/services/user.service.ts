import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUserResponse {
  total: number;
  page: number;
  totalPages: number;
  users: User[];
}

export interface UpdateRoleResponse {
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Récupère tous les utilisateurs avec pagination et recherche
   */
  getAllUsers(page: number = 1, limit: number = 8, search?: string, role?: string): Observable<PaginatedUserResponse> {
    let url = `${this.apiUrl}/all?page=${page}&limit=${limit}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    if (role) {
      url += `&role=${encodeURIComponent(role)}`;
    }

    return this.http.get<PaginatedUserResponse>(url, { headers: this.getHeaders() });
  }

  /**
   * Récupère un utilisateur par son ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Modifie le rôle d'un utilisateur (Admin seulement)
   */
  updateUserRole(userId: string, newRole: string): Observable<UpdateRoleResponse> {
    return this.http.put<UpdateRoleResponse>(
      `${this.apiUrl}/${userId}/role`, 
      { role: newRole }, 
      { headers: this.getHeaders() }
    );
  }

  /**
   * Supprime un utilisateur (Admin seulement)
   */
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /**
   * Met à jour un utilisateur (Admin seulement)
   */
  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData, { headers: this.getHeaders() });
  }
} 