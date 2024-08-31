import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { catchError, throwError } from 'rxjs';
import { Category, Status } from 'src/app/modules/category';
import { CategoryService } from 'src/app/services/category/category.service';
import { MessageDemoService } from 'src/app/services/message/message.service';

@Component({
  selector: 'app-categories',
  templateUrl: './listdemo.component.html',
  providers: [ConfirmationService]
})
export class ListDemoComponent implements OnInit {
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
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private messagedemoService: MessageDemoService
  ) { }

  add(categoryName: string): void {
    // Check if the category name is non-empty and trimmed
    if (!categoryName.trim()) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Validation Error',
            detail: 'Category name cannot be empty or whitespace.'
        });
        return;
    }

    const newCategory: Category = {
        id: 0, // Assuming the ID will be generated by the backend
        name: categoryName.trim(),
        status: 'ACTIVE'
    };

    this.categoryService.createCategory(newCategory).pipe(
      catchError(error => {
        if (error.status === 400) {
          this.messagedemoService.message('error', 'This category already exists!');

        }
        return throwError(error);
     })
     )
     .subscribe();
    //console.log('Category:', newCategory);
    this.inputVisible = false;
    this.buttonLabel = 'Add Category';

    this.categoryService.createCategory(newCategory).subscribe(
        data => {
            this.findAll(); // Refresh the category list
            this.messageService.add({
                severity: 'success',
                summary: 'Category Added',
                detail: `${categoryName} has been added successfully!`
            });
        },
        error => {
            console.error('Error creating category', error);

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

  toggleInput(): void {
    if (this.inputValue.trim() && this.inputVisible) {
      console.log('data here : ' + this.inputValue);
      this.add(this.inputValue);
      this.inputValue = '';
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

  onGlobalFilter(table: Table, event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(filterValue, 'contains');
  }

 async delete(categoryId: number, status: Status): Promise<void> {
  if (status === 'ACTIVE') {
    if(await this.messagedemoService.confirmed('Delete Confirmation','Do you want to delete this category?','Yes','No','WHITE','BLUE')){
      this.categoryService.softDeleteCategory(categoryId).subscribe({
        complete:()=>{
          this.findAll();
          this.messagedemoService.message('success','Category has been deleted successfully!');
         },
         error:(err) => {
          {
           console.error('Error deleting category',err);
           this.messagedemoService.message('error','Failed to delete the category.');
          }
         }

  delete(categoryId: number, status: Status): void {
    if (status === 'ACTIVE') {
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete this category?',
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.categoryService.softDeleteCategory(categoryId).subscribe({
           complete:()=>{
            this.findAll();
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Category has been deleted successfully!'
              });
           },

            error:(err) => {
             {
              console.error('Error deleting category',err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete the category.'
              });
             }
            }
          });
        },
        reject: () => {
          console.log('Delete action cancelled');
          this.messageService.add({
            severity: 'info',
            summary: 'Cancelled',
            detail: 'Delete action cancelled.'
          });
        }
      });
    }else{
      console.log('Delete action cancelled');
      this.messagedemoService.message('info','Delete action cancelled.');
    }
  }
  else if (status === 'SOFT_DELETE') {
    if(await this.messagedemoService.confirmed('Restore Confirmation','Do you want to restore this category?','Yes','No','WHITE','BLUE')){
      this.categoryService.softUndeleteCategory(categoryId).subscribe({
        complete:()=>{
          this.findAll();
          this.messagedemoService.message('success','Category has been restored successfully!');
        },
        error:(err)=>{
            console.error('Error restoring category', err);
            this.messagedemoService.message('error','Failed to restore the category.'); 
        }
        });
    }else{
      console.log('Restore action cancelled');
      this.messagedemoService.message('info','Restore action cancelled.');
    }
  }
}
}
