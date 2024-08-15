import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  constructor() { }

  spinner = document.getElementById('nb-global-spinner');

  hideSpinner() {
    if (this.spinner) {
      this.spinner.style.display = 'none';
    }
  }

  // showSpinner() {
  //   if (this.spinner) {
  //     this.spinner.style.display = 'block';
  //   }
  // }
}
