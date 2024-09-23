import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SystemService } from 'src/app/services/system/system.service';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [],
  templateUrl: './server-error.component.html',
  styleUrl: './server-error.component.scss'
})
export class ServerErrorComponent implements OnInit {
  constructor(public systemService: SystemService, public authService: AuthService) { }
  ngOnInit(): void {
    this.authService.severConnectionTest();
    this.authService.restartPage();
  }
}
