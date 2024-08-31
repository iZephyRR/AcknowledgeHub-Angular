import { Injectable, signal } from '@angular/core';
import { LocalStorageService } from '../local-storage/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  constructor(private localStorageService: LocalStorageService) { }

  private loading = signal(false);
  private loadingMessage = signal('');
//  private activeInOtherTab = signal(false);

  showLoading(message: string): void {
    console.log("show loading");
    this.loading.set(true);
    this.loadingMessage.set(message);
  }

  hideLoading(): void {
    this.loading.set(false);
    this.loadingMessage.set('');
  }

  isLoading() {
    return this.loading();
  }

  getLoadingMessage() {
    return this.loadingMessage();
  }

  // get isActiveInOtherTab(): boolean {
  //   return this.activeInOtherTab();
  // }

  // set isActiveInOtherTab(isActive: boolean) {
  //   this.activeInOtherTab.set(isActive);
  // }
}
