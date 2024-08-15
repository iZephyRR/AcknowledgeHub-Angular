import { Component, OnInit } from '@angular/core';
import { SystemService } from 'src/app/services/system/system.service';

@Component({
    selector: 'app-notfound',
    templateUrl: './notfound.component.html',
})
export class NotfoundComponent implements OnInit{ 
constructor(private systemService:SystemService){}
    ngOnInit(): void {
        this.systemService.hideSpinner();
    }
}