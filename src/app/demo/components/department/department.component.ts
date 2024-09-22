import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Department } from 'src/app/modules/department';
import { User } from 'src/app/modules/user';
import { DepartmentService } from 'src/app/services/department/department.service';
import { UserService } from 'src/app/services/user/user.service';
import { EditDepartmentComponent } from '../edit-department/edit-department.component';
import { EditDepartmentService } from 'src/app/services/edit-department/edit-department.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrl: './department.component.scss'
})
export class DepartmentComponent implements OnInit, OnDestroy {
  @ViewChild('filter') filter!: ElementRef;
  users: User[] = [];
  department: Department;

  private routerSubscription: Subscription;

  constructor(
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    public editDepartmentValidator: EditDepartmentService,
    private authService: AuthService

  ) {

  }

  ngOnInit(): void {
    this.loadUsers();
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadUsers();
      }
    });
  }

  loadUsers(): void {
    this.departmentService.getDTOById(this.route.snapshot.paramMap.get('id')).subscribe({
      next: (departmentData) => {
        this.department = departmentData;
      },

      complete: () => {
        this.userService.getAllByDepartmentID(this.department.id).subscribe({
          next: (departmentData:User[]) => {
            this.users = departmentData;
          },
          error: (err) => {
            console.error(err);
           this.authService.showNotFoundPage();
          }
        });
      },

      error: (err) => {
        console.error(err);
        this.authService.showNotFoundPage();
      }
    });

  }
  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  editDepartment(): void {
    this.editDepartmentValidator.department=this.department;
    this.editDepartmentValidator.showView = true;
  }

}
