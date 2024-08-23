import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { AuthService } from '../services/auth/auth.service';
import { Role } from '../modules/check-auth';
import { AppComponent } from '../app.component';
import { ProfileComponent } from '../demo/components/profile/profile.component';
import { UserService } from '../services/user/user.service';
import { User } from '../modules/user';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit {
  user: User;
  items!: MenuItem[];

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  visibleSidebar: boolean = false;

  isProfileCardVisible = false;

  showProfileCard() {
    this.isProfileCardVisible = !this.isProfileCardVisible;
  }

  closeProfileCard() {
    this.isProfileCardVisible = false;
}

  constructor(public layoutService: LayoutService, private userService: UserService) { }
  ngOnInit(): void {
    const userId = 1;
    this.userService.getUserById(userId).subscribe(data => {
      this.user = data;
    });
  }
}
