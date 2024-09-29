import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomTergetGroup } from 'src/app/modules/custom-target-group';

@Injectable({
  providedIn: 'root'
})
export class CustomTargetGroupService {
  private static readonly baseUrl: string = 'http://localhost:8080/api/v1/custom-target';
  showEntity:boolean=false;

  constructor(private http: HttpClient) {
  }

  save(customGroup: CustomTergetGroup): Observable<void> {
    return this.http.post<void>(`${CustomTargetGroupService.baseUrl}`, customGroup);
  }

  findById(id:number):Observable<CustomTergetGroup>{
    return this.http.get<CustomTergetGroup>(`${CustomTargetGroupService.baseUrl}/${id}`);
  }

  findAllByHRID():Observable<CustomTergetGroup[]>{
    return this.http.get<CustomTergetGroup[]>(`${CustomTargetGroupService.baseUrl}/by-hr`)
  }

  findAll():Observable<CustomTergetGroup[]>{
    return this.http.get<CustomTergetGroup[]>(`${CustomTargetGroupService.baseUrl}`);
  }

  deleteById(id:number):Observable<void>{
    return this.http.delete<void>(`${CustomTargetGroupService.baseUrl}/${id}`);
  }

  findReceiverName(receiverType:'DEPARTMENT' | 'COMPANY' | 'EMPLOYEE' | 'CUSTOM',receiverId:number):Observable<{STRING_RESPONSE:string}>{
    return this.http.get<{STRING_RESPONSE:string}>(`http://localhost:8080/api/v1/custom-group-entity?receiverType=${receiverType}&receiverId=${receiverId}`);
  }

}
