import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Department } from 'src/app/modules/department';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private baseUrl = 'http://localhost:8080/api/v1/hrs/department';
  constructor(private http: HttpClient) { }

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}`);
  }

  getAllByCompany(id:bigint): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/by-company/${id}`);
  }

  getDTOById(id:string): Observable<Department>{
    return this.http.get<Department>(`${this.baseUrl}/dto/${id}`);
  }
  
}
