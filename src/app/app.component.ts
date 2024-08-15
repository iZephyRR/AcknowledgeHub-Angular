import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit {

  constructor(private primengConfig: PrimeNGConfig) { }

  ngOnInit() {
    this.primengConfig.ripple = true;
  }

  ngAfterViewInit() {
    this.hideSpinner();
  }

  hideSpinner() {
    setTimeout(() => {
      const spinner = document.getElementById('nb-global-spinner');
      if (spinner) {
        spinner.style.display = 'none';
      }
    }, 8000); // 3 seconds delay before hiding the spinner
  }
}
