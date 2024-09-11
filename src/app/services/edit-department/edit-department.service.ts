import { Injectable } from '@angular/core';
import { Company } from 'src/app/modules/company';
import { Department } from 'src/app/modules/department';
import { User } from 'src/app/modules/user';
import * as XLSX from 'xlsx';

interface FieldError {
  row: number;
  col: number;
  message: string;
  type: 'error' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class EditDepartmentService {
  showView: boolean;
  apiJsonData: any[][] = [];
  jsonData: any[] = [];
  fieldErrors: FieldError[] = [];
  company: Company;
  department: Department;
  users: User[];
  hasError: boolean;
  constructor() { }


  onFileChange(event: any) {
    //  console.log(JSON.stringify(event.target.files[0]));
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        console.log('Reader loading');
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        let maxColIndex = 0;
        let maxRowIndex = 0;
        this.jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
          dateNF: 'yyyy-mm-dd'
        });
        this.jsonData = this.jsonData.map((row, rowIndex) => {
          maxRowIndex = rowIndex;
          if (rowIndex === 0) return row;
          return row.map((cell: any, colIndex: number) => {
            if (maxColIndex < colIndex) {
              maxColIndex = colIndex;
            }
            return cell;
          });
        });
        for (let i = 0; i < maxRowIndex + 1; i++) {
          if (this.jsonData[i] != '') {
            if (this.jsonData[i][maxColIndex] == undefined) {
              this.jsonData[i][maxColIndex] = null;
            }
          }
        }

        this.jsonData = this.jsonData.filter(row => row != '');
        this.validateData(this.apiJsonData);
      };
        reader.readAsArrayBuffer(file);
    }
  }
  getFieldError(rowIndex: number, colIndex: number): FieldError | null {
    return this.fieldErrors.find(e => e.row === rowIndex && e.col === colIndex) || null;
  }
  updateCellValue(rowIndex: number, colIndex: number, event: any) {
    const newValue = event.target.value;
    this.jsonData[rowIndex + 1][colIndex] = newValue;

    this.fieldErrors = this.fieldErrors.filter(e => e.row !== rowIndex + 1 || e.col !== colIndex);

    this.validateData(this.jsonData);
  }
  validateData(data: any): void {
    this.hasError = false;
    const errors: FieldError[] = [];
    const headers = data[0];
    let headersForSystem = headers.map((data: string) => {
      return this.formatToCommonCase(data);
    });
    const nameIndex = headersForSystem.indexOf('name');
    const idIndex = headersForSystem.indexOf('stuffid');
    const emailIndex = headersForSystem.indexOf('email');
    const telegramUsernameIndex = headersForSystem.indexOf('telegramusername');
    const nrcIndex = headersForSystem.indexOf('nrc');
    const genderIndex = headersForSystem.indexOf('gender');

    const dobIndex = headersForSystem.indexOf('dateofbirth');
    const addressIndex =headersForSystem.indexOf('address');
    const entIndex = headersForSystem.indexOf('entrydate');
    headers.forEach((header: string, colIndex: number) => {
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const name = row[nameIndex];
        const id = row[idIndex];
        const email = row[emailIndex];
        const telegramUsername = row[telegramUsernameIndex];
        const nrc = row[nrcIndex];
        const gender = row[genderIndex];
        const dob = row[dobIndex];
        const address = row[addressIndex];
        const ent = row[entIndex];
      if (row[colIndex] === null || row[colIndex] === undefined || row[colIndex] === '') {
        errors.push({ row: i, col: colIndex, message: `${header} is required.`, type: 'error' });
        this.hasError = true;
      }
      if (this.validateInput(row[colIndex])) {
        errors.push({ row: i, col: colIndex, message: `${header} field is not allow this font.`, type: 'error' });
        this.hasError = true;
      }
    }

    });
    this.fieldErrors = errors;
  }
  validateInput(input: string): boolean {
    const regex = /^[A-Za-z0-9!@#$%^&*(),.?":{}|<>/\- ]+$/;

    // Check if the input matches the pattern
    return !regex.test(input);
  }
  insertFromApi(users: User[]): void {
    this.apiJsonData[0] = [];
    this.apiJsonData[0].push('Name');
    this.apiJsonData[0].push('Staff-ID');
    this.apiJsonData[0].push('Email');
    this.apiJsonData[0].push('Telegram Username');
    this.apiJsonData[0].push('NRC');
    this.apiJsonData[0].push('Gender');
    this.apiJsonData[0].push('Date of Birth');
    this.apiJsonData[0].push('Address');
    this.apiJsonData[0].push('Entry Date');
    this.apiJsonData[0].push('Status');
    users.forEach((user, index) => {
      this.apiJsonData[index + 1] = [];
      this.apiJsonData[index + 1].push(user.name);
      this.apiJsonData[index + 1].push(user.staffId);
      this.apiJsonData[index + 1].push(user.email);
      this.apiJsonData[index + 1].push(user.telegramUsername);
      this.apiJsonData[index + 1].push(user.nrc);
      this.apiJsonData[index + 1].push(user.gender);
      this.apiJsonData[index + 1].push(user.dob);
      this.apiJsonData[index + 1].push(user.address);
      this.apiJsonData[index + 1].push(user.workEntryDate);
      this.apiJsonData[index + 1].push(user.status);
    });
    console.log('apiJsonData :' + this.apiJsonData);
  }
  formatToCommonCase(input: string): string {
    return input.trim().toLowerCase().replaceAll(" ", "").replaceAll("-", "").replaceAll("_", "");
  }
}
