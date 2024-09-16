import { Injectable, signal } from '@angular/core';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { HttpEvent } from '@angular/common/http';
import { Role } from 'src/app/constants';

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  constructor(private localStorageService: LocalStorageService, private router: Router) { }

  //For loading component
  private loading = signal(false);
  private loadingMessage = signal('');
  private isBackgroundHide = signal(false);
  //For progress component
  private showValue = signal(false);
  private pauseProgress = signal(true);
  private progress = signal(0);
  private blockBackground = signal(false);
  private message = signal('');
  //Current rout
  public currentRout = signal('');

  showLoading(message: string, hideBackground?: boolean): void {
    this.loading.set(true);
    this.loadingMessage.set(message);
    if (hideBackground) {
      this.isBackgroundHide.set(hideBackground);
    }
  }

  hideLoading(): void {
    this.loading.set(false);
    this.loadingMessage.set('');
    this.isBackgroundHide.set(false);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async showProgress(
    message: string,
    showValue: boolean,
    blockBackground: boolean,
    delaiedSecUntail90: number
  ): Promise<void> {
    if (this.pauseProgress()) {
      this.message.set(message);
      this.showValue.set(showValue);
      this.blockBackground.set(blockBackground);
      this.pauseProgress.set(false);
      const inOnePercentDelay: number = (delaiedSecUntail90 * 1000) / 90;

      for (let i = 1; i <= 90; i++) {
        this.progress.set(i);
        await this.delay(inOnePercentDelay); // Wait for the delay before the next iteration
        if (this.pauseProgress()) {
          break;
        }
      }
    } else {
      console.warn('Cannot create 2 progress dialogue in a time. But it does not effect on real work.');
    }
  }

  stopProgress(status?: 'ERROR'): Promise<boolean> {
    return new Promise(async (resolve) => {
      if (status) {
        this.pauseProgress.set(true);
        this.message.set('');
        this.showValue.set(false);
        this.blockBackground.set(false);
        this.progress.set(0);
        resolve(true);
      } else {
        this.pauseProgress.set(true);
        for (let i = 91; i <= 100; i++) {
          this.progress.set(i);
          await this.delay(200);
        }
        setTimeout(() => {
          this.message.set('');
          this.showValue.set(false);
          this.blockBackground.set(false);
          this.progress.set(0);
          resolve(true);
        }, 1000)
      }
    });
  }

  isLoading() {
    return this.loading();
  }

  getIsBackgroundHide(): boolean {
    return this.isBackgroundHide();
  }

  getLoadingMessage() {
    return this.loadingMessage();
  }

  restartPage(): void {
    this.router.navigate(['/']);
  }


  getShowValue(): boolean {
    return this.showValue();
  }

  getProgress(): number {
    return this.progress();
  }

  getBlockBackground(): boolean {
    return this.blockBackground();
  }

  getMessage(): string {
    return this.message();
  }

  changeRoleToNormalCase(role: Role): string {
    switch (role) {
      case 'ADMIN':
        return 'Admin'
      case 'MAIN_HR':
        return 'Main HR'
      case 'MAIN_HR_ASSISTANCE':
        return 'Main HR assistance'
      case 'HR_ASSISTANCE':
        return 'HR assistance'
      case 'STAFF':
        return 'Staff'
      default:
        return role;
    }
  }
}
