import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    templateUrl: './treedemo.component.html'
})
export class TreeDemoComponent implements OnInit {
  selectedAudience: string = 'company';
  selectedSchedule: string = 'now';
  recipientsList = []; // Example data, replace with real data

  constructor() {
    this.updateRecipientsList();
  }
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }

  updateRecipientsList() {
    // Update the recipientsList based on the selected audience
    // Example logic:
    if (this.selectedAudience === 'department') {
      this.recipientsList = [{ id: 1, name: 'HR' }, { id: 2, name: 'Engineering' }];
    } else if (this.selectedAudience === 'individual') {
      this.recipientsList = [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Smith' }];
    } else {
      this.recipientsList = [];
    }
  }

  onSubmit(form: any) {
    if (form.valid) {
      console.log(form.value);
      // Process the form submission, e.g., call an API to create the announcement
    }
  }

  cancel() {
    // Handle cancellation logic, e.g., navigate back to the previous page
  }
}
