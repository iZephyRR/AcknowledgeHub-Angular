import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface Session {
  key: string;
  value: any;
}
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private static readonly STORAGE_KEY = 'sessions';
  private static sessions: Session[] = [];

  constructor(private router: Router) {
    try {
      const storedSessions = localStorage.getItem(LocalStorageService.STORAGE_KEY);
     // console.log('storedSession '+JSON.stringify(storedSessions));
      if (storedSessions) {
        LocalStorageService.sessions = JSON.parse(storedSessions);
      }
    } catch (error) {
      //console.error('LocalHost error : '+error);
      //Hide the error :->
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(LocalStorageService.STORAGE_KEY, JSON.stringify(LocalStorageService.sessions));
    } catch (error) {
      //console.error('LocalHost error : '+error);
      //Hide the error :->
    }
  }
  add(key: string, value: any): void {
    this.remove(key);
    LocalStorageService.sessions.push({ key: key, value: value });
    this.saveToStorage();
  }
  
  removeMany(keys: string[]): void {
    keys.forEach(element => {
      this.remove(element);
    });
  }

  get(key: string): any {
    return LocalStorageService.sessions.find(session => session.key === key)?.value;

  }
  remove(key: string): void {
    LocalStorageService.sessions = LocalStorageService.sessions.filter(session => session.key !== key);
    this.saveToStorage();
  }

  getAll(): Session[] {
    return LocalStorageService.sessions;
  }

  clear(): void {
    LocalStorageService.sessions = [];
    this.saveToStorage();
  }
  
  restartPage(): void {
    this.router.navigate(['/']);
  }
}
