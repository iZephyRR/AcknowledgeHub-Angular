import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from 'src/app/modules/category';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'http://localhost:8080/api/v1/mr/category'; 

  constructor(private http: HttpClient) { }

  createCategory(category:Category): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/create`, category);
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/get-all`);
  }

  softDeleteCategory(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/disable/${id}`, {});
  }
  softUndeleteCategory(categoryId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/enable/${categoryId}`, {});
  }
}