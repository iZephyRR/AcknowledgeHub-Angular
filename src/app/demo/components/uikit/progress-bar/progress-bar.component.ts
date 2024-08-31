import { Component, signal } from '@angular/core';
import { SystemService } from 'src/app/services/system/system.service';

@Component({
  selector: 'app-progress-bar',
templateUrl:'progress-bar.component.html',
  styleUrls:[ './progress-bar.component.scss']
})
export class ProgressBarComponent {
constructor(public systemService:SystemService){}
}
