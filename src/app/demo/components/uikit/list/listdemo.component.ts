import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Category } from 'src/app/modules/category';
import { CategoryService } from 'src/app/services/category/category.service';



@Component({
  selector: 'app-categories',
  templateUrl: './listdemo.component.html',
  providers: [ConfirmationService, MessageService]
})
export class ListDemoComponent implements OnInit {
  categories: Category[] = [];
  sortedArray: Category[] = [];
  check: boolean = false;
  inputVisible: boolean = false;
  buttonLabel: string = 'Add Category';
  inputValue: string = '';
  loading: boolean = false;
  @ViewChild('editConfirmDialog') editConfirmDialog: any;
  @ViewChild('deleteConfirmDialog') deleteConfirmDialog: any;

  constructor(private categoryService: CategoryService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  add(categoryName: string): void {
    if (!categoryName.trim()) return; // Prevent empty category names



    //console.log('Category:', newCategory);
    this.inputVisible = false;
    this.buttonLabel = 'Add Category';

    this.categoryService.createCategory(categoryName).subscribe(
      data => {
        this.findAll();
      },
      error => {
        console.error('Error creating category', error);
      }
    );
  }

  findAll(): void {
    this.categoryService.getAllCategories().subscribe(
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
      console.log('data here : '+this.inputValue);
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
  confirm1(category: Category): void {
    this.confirmationService.confirm({
      key: 'confirm1',
      message: `Are you sure you want to delete the category "${category.name}"?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.categoryService.softDeleteCategory(Number(category.id)).subscribe(
          () => {
            this.findAll(); // Refresh the category list
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `Category "${category.name}" has been deleted.` });
          },
          error => {
            console.error('Error deleting category', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete category.' });
          }
        );
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelled', detail: `Deletion of category "${category.name}" was cancelled.` });
      }
    });
  }


  editCategory(category: Category): void {
    console.log('Edit category called for:', category); // Add this line for debugging
    this.confirmationService.confirm({
      key: 'editConfirm',
      message: ` Are you sure you want to edit the category "${category.name}"?`,
      header: 'Edit Confirmation',
      icon: 'pi pi-pencil',
      accept: () => {
        this.messageService.add({ severity: 'info', summary: 'Edit Confirmed', detail: `Category "${category.name}" will be edited` });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Edit Canceled', detail: `Editing category "${category.name}" was canceled` });
      }
    });
  }

  isValidCategoryName(name: string): boolean {
    if (!name.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Category name cannot be empty.' });
      return false;
    }

    const isDuplicate = this.categories.some(category => category.name.toLowerCase() === name.trim().toLowerCase());
    if (isDuplicate) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Category name already exists.' });
      return false;
    }

    return true;
  }
}
