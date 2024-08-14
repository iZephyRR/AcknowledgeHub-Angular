import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }
  
  comfirmed(message:string): boolean{
    return window.confirm(message);
  }
}
