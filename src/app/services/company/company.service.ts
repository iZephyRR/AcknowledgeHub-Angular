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

  getAllCompanies () : Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/get-companies`);
  }

  getCompanyById (id : number) : Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/getCompanyById/${id}`);
  }

}
