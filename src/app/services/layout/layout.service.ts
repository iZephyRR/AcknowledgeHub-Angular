import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private profileVisibleSubject = new BehaviorSubject<boolean>(false);

  profileVisible$ = this.profileVisibleSubject.asObservable();

  toggleProfileSidebar() {
    const currentState = this.profileVisibleSubject.getValue();
    this.profileVisibleSubject.next(!currentState);
  }
}
