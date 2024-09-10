import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MessageDemoService } from 'src/app/services/message/message.service';
import { SystemService } from 'src/app/services/system/system.service';

@Component({
    selector: 'app-notfound',
    templateUrl: './notfound.component.html'
})
export class NotfoundComponent implements OnInit{ 
constructor(private systemService:SystemService,public authService:AuthService){}

    ngOnInit(): void {
        this.systemService.hideLoading();
    }
}