import { Component } from '@angular/core';
import { SystemService } from 'src/app/services/system/system.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']  // Corrected from 'styleUrl' to 'styleUrls'
})
export class LoadingComponent {
  constructor(public systemService: SystemService) {}
}
