import { Component, OnInit } from '@angular/core';
import { MessageDemoService } from 'src/app/services/message/message.service';
import { SystemService } from 'src/app/services/system/system.service';

@Component({
    selector: 'app-notfound',
    templateUrl: './notfound.component.html',
})
export class NotfoundComponent implements OnInit{ 
constructor(private systemService:SystemService,private messageService:MessageDemoService){}

    ngOnInit(): void {
        this.systemService.hideSpinner();
        //this.messageService.sentWindowNotification('Hi there!',{body:'ur welcome from not found page!'});
    }
}