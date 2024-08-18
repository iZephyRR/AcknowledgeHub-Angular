import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../../modules/categroy';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private baseUrl = 'http://localhost:8080/api/v1/mr/create-category'; 
  private baseUrl1 = 'http://localhost:8080/api/v1/mr/get-categories';

  constructor(private http: HttpClient) { }

  createCategory(category:Category): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl1);
  }

  softDeleteCategory(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/soft-delete`, {});
  }
}