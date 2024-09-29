import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Company, CompanyRequest, HR } from 'src/app/modules/company';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private baseUrl = 'http://localhost:8080/api/v1';
  constructor(private http: HttpClient,
    private authService: AuthService
  ) { }

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/mr/get-companies`);
  }

  getAllDTO(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/mr/get-company-dtos`);
  }

  getById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/user/get-company/${id}`);
  }

  getDTOById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/user/get-company-dto/${id}`);
  }

  getName(): Observable<{ STRING_RESPONSE: string }> {
    return this.http.get<{ STRING_RESPONSE: string }>(`${this.baseUrl}/user/get-company-name`);
  }

  save(hr:HR):Observable<Company>{
    return this.http.post<Company>(`${this.baseUrl}/mr/company`,hr);
  }

  countCompany(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/hrs/company-count`);
  }

  getByDepartmentId(id:bigint): Observable<CompanyRequest> {
    return this.http.get<CompanyRequest>(`${this.baseUrl}/hrs/company/by-department/${id}`);
  }

  editCompany(company:Company):Observable<Company>{
    return this.http.put<Company>(`${this.baseUrl}/mhr/company`,company);
  }

}
