import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Department } from 'src/app/modules/department';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private baseUrl = 'http://localhost:8080/api/v1/mr'; 

  constructor(private http : HttpClient) { }

  getAllDepartments () : Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/get-companies`);
  }

}
