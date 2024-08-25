import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { SystemService } from 'src/app/services/system/system.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  constructor(public systemService:SystemService){}
}
