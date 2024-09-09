import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from 'src/app/modules/company';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private baseUrl = 'http://localhost:8080/api/v1';
  constructor(private http : HttpClient,
    private authService : AuthService
  ) { }

  getAll () : Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/mha/get-companies`);
  }
  
  getAllDTO () : Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/mha/get-company-dtos`);
  }

  getById (id : number) : Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/mr/get-company/${id}`);
  }

  getDTOById (id : string) : Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/user/get-company-dto/${id}`);
  }

}
