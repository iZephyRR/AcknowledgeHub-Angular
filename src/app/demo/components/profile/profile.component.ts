import { Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { User } from 'src/app/modules/user';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: User;
  

  constructor(private userService: UserService, public layoutService: LayoutService) { }

  ngOnInit(): void {
    const userId = 1; 
    this.userService.getUserById(userId).subscribe(data => {
      this.user = data;
    });
  }
 


}
