import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../../modules/category';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private baseUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient,
    private authService : AuthService
  ) { }

  createCategory(category:Category): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/mr/category/create-category`, category);

  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/get-active-categories`);
  }

  getAllCategoriesDESC(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/mr/category/get-all`);
  }

  softDeleteCategory(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/mr/category/disable/${id}`, {});

  }
  softUndeleteCategory(categoryId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/mr/category/enable/${categoryId}`, {});
  }
}
