import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import * as XLSX from 'xlsx';

@Component({
  templateUrl: './buttondemo.component.html'
})
export class ButtonDemoComponent implements OnInit {
  items: MenuItem[] = [];
  loading = [false, false, false, false];
  jsonData: any[] = []; // Array to hold parsed JSON data
  fieldErrors: { row: number; col: number; message: string; type: 'error' | 'warning' }[] = [];

  ngOnInit() {
    this.items = [
      { label: 'Upload Excel', icon: 'pi pi-upload', command: () => this.triggerFileInput() },
      { separator: true },
    ];
  }

  load(index: number) {
    this.loading[index] = true;
    setTimeout(() => this.loading[index] = false, 1000);
  }

  triggerFileInput() {
    document.getElementById('fileInput')?.click();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse the data into JSON
        this.jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Validate the data
        this.fieldErrors = this.validateData(this.jsonData);

        console.log(this.jsonData); // Output the JSON data
      };
      reader.readAsArrayBuffer(file);
    }
  }

  // Validate the uploaded data
  validateData(data: any[]): { row: number; col: number; message: string; type: 'error' | 'warning' }[] {
    const errors: { row: number; col: number; message: string; type: 'error' | 'warning' }[] = [];
    const headers = data[0];
    const emailIndex = headers.indexOf('Email'); // Change 'Email' to your actual header name
    const ageIndex = headers.indexOf('Age'); // Assuming there's an 'Age' column

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const email = row[emailIndex];
      const age = row[ageIndex];

      // Check for empty fields and categorize them as warnings
      row.forEach((cell: any, colIndex: number) => {
        if (!cell) {
          errors.push({ row: i + 1, col: colIndex, message: `${headers[colIndex]} field is empty.`, type: 'warning' });
        }
      });

      // Check if email is blank or invalid
      if (email && !this.isValidEmail(email)) {
        errors.push({ row: i + 1, col: emailIndex, message: `Invalid email format "${email}".`, type: 'warning' });
      }

      // Check if age is greater than 100
      if (age && age > 100) {
        errors.push({ row: i + 1, col: ageIndex, message: `Age is greater than 100.`, type: 'warning' });
      }
    }
    return errors; // Return all errors
  }

  // Simple email validation function
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
    return emailRegex.test(email);
  }

  // Method to retrieve error or warning message for a specific cell
  getFieldError(rowIndex: number, colIndex: number): { message: string; type: 'error' | 'warning' } | null {
    const error = this.fieldErrors.find(e => e.row === rowIndex && e.col === colIndex);
    return error ? { message: error.message, type: error.type } : null;
  }

  // Method to show error or warning message
  showErrorMessage(error: { row: number; col: number; message: string }) {
    alert(`Error in Row ${error.row}, Column ${error.col}: ${error.message}`);
  }
}