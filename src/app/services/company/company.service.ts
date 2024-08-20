import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Company } from 'src/app/modules/company';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private baseUrl = 'http://localhost:8080/api/v1/mr'; 

  constructor(private http : HttpClient) { }

  getAllCompanies () : Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/get-companies`);
  }

}
