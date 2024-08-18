import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { UserService } from 'src/app/services/user/user.service';

@NgModule({
    imports: [
        CommonModule,
        ProfileRoutingModule
    ],
    declarations: [ProfileComponent],
    providers: [UserService]  



})
export class ProfileModule { }
