import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from 'src/app/services/auth/auth.service';

import * as XLSX from 'xlsx';

// Define an interface for field errors
interface FieldError {
  row: number;
  col: number;
  message: string;
  type: 'error' | 'warning';
}

@Component({
  selector: 'app-button-demo',
  templateUrl: './buttondemo.component.html',
})
export class ButtonDemoComponent implements OnInit {
  items: MenuItem[] = [];
  jsonData: any[] = [];
  fieldErrors: FieldError[] = [];
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>; // Access the file input element

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.items = [
      { label: 'Upload Excel', icon: 'pi pi-upload', command: () => this.triggerFileInput() },
      { separator: true },
    ];
  }

  // Trigger file input click
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  // Handle file change event
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
  
        // Parse the sheet into JSON and handle date cells
        this.jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false, // Ensures dates are parsed as strings, not numbers
          dateNF: 'yyyy-mm-dd', // Initial format read, we will convert later
        });
  
        // Convert date-like numbers to actual date strings in dd/MM/yyyy format
        this.jsonData = this.jsonData.map((row, rowIndex) => {
          if (rowIndex === 0) return row; // Skip header row
          return row.map((cell, colIndex) => {
            // Convert only if the cell seems like a date based on your column header
            if (this.isDateCell(worksheet, colIndex, cell)) {
              return this.convertExcelDate(cell); // Convert the Excel date number to 'dd/MM/yyyy'
            }
            return cell;
          });
        });
  
        this.fieldErrors = this.validateData(this.jsonData);
      };
      reader.readAsArrayBuffer(file);
    }
  }
  
  // Check if a cell is a date by checking its type and format
  isDateCell(worksheet: XLSX.WorkSheet, colIndex: number, cell: any): boolean {
    const address = XLSX.utils.encode_cell({ c: colIndex, r: 1 });
    const cellObj = worksheet[address];
    return cellObj && cellObj.t === 'n' && (cellObj.z || '').includes('m'); // Checks if it's numeric and date-like
  }
  
  // Convert Excel date serial numbers to 'dd/MM/yyyy' formatted string
  convertExcelDate(excelDate: number): string {
    const date = new Date((excelDate - (25567 + 1)) * 86400 * 1000); // Convert Excel serial date to JS Date
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed in JS Date
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // Return formatted date as 'dd/MM/yyyy'
  }
  
  // Validate data and collect errors or warnings
  validateData(data: any[]): FieldError[] {
    const errors: FieldError[] = [];
    const headers = data[0];
    const emailIndex = headers.indexOf('Email');
    const idIndex = headers.indexOf('Stuff-id');
    const phoneIndex = headers.indexOf('Phone');
    const ageIndex = headers.indexOf('Age');

    // Maps to track duplicates
    const seenEmails = new Map<string, number[]>();
    const seenIds = new Map<string, number[]>();
    const seenPhones = new Map<string, number[]>();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const email = row[emailIndex];
      const id = row[idIndex];
      const phone = row[phoneIndex];
      const age = row[ageIndex];

      headers.forEach((header: string, colIndex: number) => {
        if (row[colIndex] === null || row[colIndex] === undefined || row[colIndex] === '') {
          errors.push({ row: i, col: colIndex, message: `${header} is required.`, type: 'error' });
        }
      });

      if (email && !this.validateEmail(email)) {
        errors.push({ row: i, col: emailIndex, message: 'Invalid email format.', type: 'warning' });
      } else if (email && !AuthService.isDomainAvailable(email)) {
        errors.push({ row: i, col: emailIndex, message: 'Email domain is not valid.', type: 'warning' });
      }

      if (phone && !this.validatePhone(phone)) {
        errors.push({ row: i, col: phoneIndex, message: 'Invalid Phone Number format.', type: 'warning' });
      }

      if (age !== undefined && (age < 18 || age > 100)) {
        errors.push({ row: i, col: ageIndex, message: 'Age must be between 18 and 100.', type: 'warning' });
      }

      // Track duplicates
      this.trackDuplicates(email, id, phone, i, seenEmails, seenIds, seenPhones);
    }

    // Add warnings for duplicate fields
    this.addWarningsForDuplicates(seenEmails, errors, emailIndex, 'Email');
    this.addWarningsForDuplicates(seenIds, errors, idIndex, 'Staff ID');
    this.addWarningsForDuplicates(seenPhones, errors, phoneIndex, 'Phone Number');

    return errors;
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Validate phone format
  validatePhone(phone: string): boolean {
    return /^\d+$/.test(phone);
  }

  // Track duplicates for email, ID, and phone
  trackDuplicates(
    email: string,
    id: string,
    phone: string,
    row: number,
    emails: Map<string, number[]>,
    ids: Map<string, number[]>,
    phones: Map<string, number[]>
  ) {
    if (email) {
      if (!emails.has(email)) {
        emails.set(email, []);
      }
      emails.get(email)?.push(row);
    }

    if (id) {
      if (!ids.has(id)) {
        ids.set(id, []);
      }
      ids.get(id)?.push(row);
    }

    if (phone) {
      if (!phones.has(phone)) {
        phones.set(phone, []);
      }
      phones.get(phone)?.push(row);
    }
  }

  // Add warnings for duplicates
  addWarningsForDuplicates(
    map: Map<string, number[]>,
    errors: FieldError[],
    colIndex: number,
    fieldName: string
  ) {
    map.forEach((rows, value) => {
      if (rows.length > 1) {
        rows.forEach(row => {
          errors.push({ row: row, col: colIndex, message: `Duplicate ${fieldName}: "${value}"`, type: 'warning' });
        });
      }
    });
  }

  // Get specific field error for a cell
  getFieldError(rowIndex: number, colIndex: number): FieldError | null {
    return this.fieldErrors.find(e => e.row === rowIndex && e.col === colIndex) || null;
  }

  // Show error message in an alert
  showErrorMessage(error: FieldError) {
    alert(error.message);
  }

  // Update cell value and validate the new value
  updateCellValue(rowIndex: number, colIndex: number, event: any) {
    const newValue = event.target.value;
    this.jsonData[rowIndex + 1][colIndex] = newValue;

    // Remove existing errors for the updated cell
    this.fieldErrors = this.fieldErrors.filter(e => e.row !== rowIndex + 1 || e.col !== colIndex);

    // Validate the new value and update errors
    if (newValue === null || newValue === undefined || newValue === '') {
      this.fieldErrors.push({ row: rowIndex, col: colIndex, message: 'Field is required.', type: 'error' });
    } else if (colIndex === this.jsonData[0].indexOf('Email') && !this.validateEmail(newValue)) {
      this.fieldErrors.push({ row: rowIndex, col: colIndex, message: 'Invalid email format.', type: 'warning' });
    } else if (colIndex === this.jsonData[0].indexOf('Phone') && !this.validatePhone(newValue)) {
      this.fieldErrors.push({ row: rowIndex, col: colIndex, message: 'Invalid phone format.', type: 'warning' });
    }
  }
}
