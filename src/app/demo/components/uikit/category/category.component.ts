import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { catchError, throwError } from 'rxjs';
import { Category, Status } from 'src/app/modules/category';
import { CategoryService } from 'src/app/services/category/category.service';
import { MessageDemoService } from 'src/app/services/message/message.service';

@Component({
  selector: 'app-categories',
  templateUrl: './category.component.html',
  styleUrl:'./category.component.scss'
})
export class CategoryComponent implements OnInit {
  categories: Category[] = [];
  sortedArray: Category[] = [];
  check: boolean = false;
  inputVisible: boolean = false;
  buttonLabel: string = 'Add Category';
  inputValue: string = '';
  loading: boolean = false;

  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('editConfirmDialog') editConfirmDialog: any;
  @ViewChild('deleteConfirmDialog') deleteConfirmDialog: any;

  constructor(
    private categoryService: CategoryService,
    private messagedemoService: MessageDemoService
  ) { }

  add(categoryName: string): void {
    if (!categoryName.trim()) {
      this.messagedemoService.toast('warn','Category name cannot be empty or whitespace.');
      return;
    }

    const newCategory: Category = {
      id: 0, 
      name: categoryName.trim(),
      status: 'ACTIVE'
    };
    
    this.inputVisible = false;
    this.buttonLabel = 'Add Category';

    this.categoryService.createCategory(newCategory).pipe(
      catchError(error => {
        if (error.status === 400) {
          this.messagedemoService.message('error', 'This category already exists!');

        }
        return throwError(error);
      })
    )  
    .subscribe(
      data => {
        this.findAll();
        this.messagedemoService.toast('success',`'${categoryName}' has been added successfully!`);
      },
      error => {
        console.error('Error creating category', error);
        this.messagedemoService.toast('error','Cannot add this category.');
      }
    );
  }


  findAll(): void {
    this.categoryService.getAllCategoriesDESC().subscribe(
      data => {
        if (data !== this.categories) {
          this.check = true;
          this.categories = data;
          this.sortData();
        } else {
          this.check = false;
        }
      },
      error => {
        console.error('Error fetching categories', error);
      }
    );
  }

  sortData(): void {
    this.sortedArray = [...this.categories].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }

  ngOnInit(): void {
    this.findAll();
  }

  async toggleInput(): Promise<void> {
    if (this.inputValue.trim() && this.inputVisible) {
      if ((await this.messagedemoService.confirmed('Confirmation', `Are you sure you want to add '${this.inputValue}'?`, 'Yes', 'No', 'WHITE', 'BLUE')).confirmed) {
       console.log('data here : ' + this.inputValue);
          this.add(this.inputValue);
          this.inputValue = '';
      }
    } else {
      this.inputVisible = true;
      this.buttonLabel = 'Submit';
    }
  }

  onBlur(): void {
    if (this.inputValue.trim() === '') {
      this.inputVisible = false;
      this.buttonLabel = 'Add Category';
    }
  }

  resetInput() {
    this.inputValue = ''; // Reset input field value
}

  onGlobalFilter(table: Table, event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(filterValue, 'contains');
  }

  async delete(categoryId: number, status: Status): Promise<void> {
    if (status === 'ACTIVE') {
      if ((await this.messagedemoService.confirmed('Delete Confirmation', 'Do you want to delete this category?', 'Yes', 'No', 'WHITE', 'BLUE')).confirmed) {
        this.categoryService.softDeleteCategory(categoryId).subscribe({
          complete: () => {
            this.findAll();
            this.messagedemoService.message('success', 'Category has been deleted successfully!');
          },
          error: (err) => {
            console.error('Error deleting category', err);
            this.messagedemoService.message('error', 'Failed to delete the category.');
          }
        });
    } else {
        console.log('Delete action cancelled');
        this.messagedemoService.message('info', 'Delete action cancelled.');
      }
    }
    else if (status === 'SOFT_DELETE') {
      if ((await this.messagedemoService.confirmed('Restore Confirmation', 'Do you want to restore this category?', 'Yes', 'No', 'WHITE', 'BLUE')).confirmed) {
        this.categoryService.softUndeleteCategory(categoryId).subscribe({
          complete: () => {
            this.findAll();
            this.messagedemoService.message('success', 'Category has been restored successfully!');
          },
          error: (err) => {
            console.error('Error restoring category', err);
            this.messagedemoService.message('error', 'Failed to restore the category.');
          }
        });
      } else {
        console.log('Restore action cancelled');
        this.messagedemoService.message('info', 'Restore action cancelled.');
      }
    }
  }
}
