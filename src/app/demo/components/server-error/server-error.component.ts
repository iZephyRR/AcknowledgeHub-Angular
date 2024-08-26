import { Component, OnInit } from '@angular/core';
import { SystemService } from 'src/app/services/system/system.service';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [],
  templateUrl: './server-error.component.html',
  styleUrl: './server-error.component.scss'
})
export class ServerErrorComponent implements OnInit{
constructor(private systemService:SystemService){}
ngOnInit(): void {
  this.systemService.hideLoading();
}
}
