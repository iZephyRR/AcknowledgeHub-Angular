import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomTergetGroup } from 'src/app/modules/custom-target-group';

@Injectable({
  providedIn: 'root'
})
export class CustomTargetGroupService {
  private static readonly baseUrl: string = 'http://localhost:8080/api/v1/custom-target';
  constructor(private http: HttpClient) {
  }

  save(customGroup: CustomTergetGroup): Observable<void> {
    return this.http.post<void>(`${CustomTargetGroupService.baseUrl}`, customGroup);
  }

  findById(id:number):Observable<CustomTergetGroup>{
    return this.http.get<CustomTergetGroup>(`${CustomTargetGroupService.baseUrl}/${id}`);
  }

  findAll():Observable<CustomTergetGroup[]>{
    return this.http.get<CustomTergetGroup[]>(`${CustomTargetGroupService.baseUrl}`);
  }

  deleteById(id:number):Observable<void>{
    return this.http.delete<void>(`${CustomTargetGroupService.baseUrl}/${id}`);
  }
}
