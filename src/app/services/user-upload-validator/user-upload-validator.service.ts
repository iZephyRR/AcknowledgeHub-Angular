import { ElementRef, Injectable, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { AuthService } from '../auth/auth.service';
import { User } from 'src/app/modules/user';
import { Users } from 'src/app/modules/user-excel-upload';
import { Company } from 'src/app/modules/company';
import { UserService } from '../user/user.service';
import { UniqueFields } from 'src/app/modules/unique-fields';
import { MessageDemoService } from '../message/message.service';

interface FieldError {
  row: number;
  col: number;
  message: string;
  type: 'error' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class UserUploadValidatorService {
  jsonData: any[] = [];
  fieldErrors: FieldError[] = [];
  hasError: boolean;
  company: Company;
  departmentName: string;
  showExcelImport: boolean;
  constructor(
    private userService: UserService,
    private messageService: MessageDemoService
  ) { }

  // Handle file change event
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('starting');
      const reader = new FileReader();
      reader.onload = (e: any) => {
        console.log('reader loading')
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
            console.log('colIndex : ' + colIndex + ' maxclo : ' + maxColIndex);
            if (maxColIndex < colIndex) {
              maxColIndex = colIndex;
            }
            if (this.isDateCell(worksheet, colIndex, cell)) {
              return this.convertExcelDate(cell);
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
        this.validateData(this.jsonData);
      };
      reader.readAsArrayBuffer(file);
      this.showExcelImport = true;
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
  validateData(data: any[]): void {
    let uniqueFields: UniqueFields;
    this.userService.getUniqueFields().subscribe({
      next: (data) => {
        uniqueFields = data;
      },
      complete: () => {
        this.hasError = false;
        // const errors: FieldError[] = [];
        this.fieldErrors = [];
        const headers = data[0];
        let headersForSystem = headers.map((data: string) => {
          return this.formatToCommonCase(data);
        });
        const emailIndex = headersForSystem.indexOf('email');
        const idIndex = headersForSystem.indexOf('staffid');
        const ageIndex = headersForSystem.indexOf('age');
        const nameIndex = headersForSystem.indexOf('name');
        const nrcIndex = headersForSystem.indexOf('nrc');
        const telegramUsernameIndex = headersForSystem.indexOf('telegramusername');
        const dobIndex = headersForSystem.indexOf('dateofbirth');
        // const addressIndex = headersForSystem.indexOf('address');
        // const genderIndex = headersForSystem.indexOf('gender');

        const seenEmails = new Map<string, number[]>();
        const seenIds = new Map<string, number[]>();
        const seenNames = new Map<string, number[]>();

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const email = row[emailIndex];
          const id = row[idIndex];
          const age = row[ageIndex];
          const name = row[nameIndex];
          const nrc = row[nrcIndex];
          const telegramUsername = row[telegramUsernameIndex];
          const dob = row[dobIndex];
          // const address = row[addressIndex];
          // const gender = row[genderIndex];

          headers.forEach((header: string, colIndex: number) => {
            if (row[colIndex] === null || row[colIndex] === undefined || row[colIndex] === '') {
              this.fieldErrors.push({ row: i, col: colIndex, message: `${header} is required.`, type: 'error' });
              this.hasError = true;
            }
            if (this.validateInput(row[colIndex])) {
              this.fieldErrors.push({ row: i, col: colIndex, message: `${header} field is not allow this font.`, type: 'error' });
              this.hasError = true;
            }


            // if (this.jsonData[colIndex] == undefined) {
            //   headers[colIndex] = undefined;
            // }
          });

          if (email && !this.validateEmail(email)) {
            this.fieldErrors.push({ row: i, col: emailIndex, message: 'Invalid email format.', type: 'error' });
            this.hasError = true;
          } else if (email && !AuthService.isDomainAvailable(email)) {
            this.fieldErrors.push({ row: i, col: emailIndex, message: 'Email domain is not valid.', type: 'error' });
            this.hasError = true;
          }

          if (age !== undefined && (age < 18 || age > 85)) {
            this.fieldErrors.push({ row: i, col: ageIndex, message: 'Age must be between 18 and 85.', type: 'error' });
            this.hasError = true;
          }

          if (this.validateName(name)) {
            this.fieldErrors.push({ row: i, col: nameIndex, message: 'Double check this name. It may be invalid.', type: 'warning' });
          }
          if (uniqueFields.emails.includes(email)) {
            this.fieldErrors.push({ row: i, col: emailIndex, message: 'This email is already use by another employee.', type: 'error' });
            this.hasError = true;
          }
          if (uniqueFields.nrcs.includes(nrc)) {
            this.fieldErrors.push({ row: i, col: nrcIndex, message: 'This NRC number is same as another employee.', type: 'warning' });
          }
          if (uniqueFields.staffIds.includes(id)) {
            this.fieldErrors.push({ row: i, col: idIndex, message: 'This Staff-ID is already exist.', type: 'warning' });
          }
          if (uniqueFields.telegramUsernames.includes(telegramUsername)) {
            this.fieldErrors.push({ row: i, col: telegramUsernameIndex, message: 'This telegram username is already use by another employee.', type: 'error' });
            this.hasError = true;
          }
          if (this.validateDate(dob)) {
            this.fieldErrors.push({ row: i, col: dobIndex, message: 'Our date format is yyyy-mm-dd.', type: 'error' });
            this.hasError = true;
          }


          // this.trackDuplicates(email, id, name, i, seenEmails, seenIds, seenNames);
          this.trackDuplicate(email, seenEmails, i);
          this.trackDuplicate(id, seenIds, i);
          this.trackDuplicate(name, seenNames, i);
        }

        this.checkDuplicates(seenEmails, emailIndex, 'Email', 'error');
        this.checkDuplicates(seenIds, idIndex, 'Staff ID', 'error');
        this.checkDuplicates(seenNames, nameIndex, 'Name', 'warning');
      },
      error: (err) => {
        this.messageService.toast('error', 'An error occurred when validate data.');
        console.error(err);
      }
    });

  }

  validateInput(input: string): boolean {
    const regex = /^[A-Za-z0-9!@#$%^&*(),.?":{}_|<>/\- ]+$/;

    // Check if the input matches the pattern
    return !regex.test(input);
  }

  validateName(input: string): boolean {
    const regex = /^([A-Z][a-z.]+)(\s[A-Z][a-z]+)*$/;
    return !regex.test(input);
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  validateDate(date: string): boolean {
    const re = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    return !re.test(date);
  }

  // Validate phone format
  validatePhone(phone: string): boolean {
    return /^\d+$/.test(phone);
  }

  // Track duplicates for email, ID, and phone
  trackDuplicate(incomingData: string, existingData: Map<string, number[]>, row: number) {
    if (incomingData) {
      if (!existingData.has(incomingData)) {
        existingData.set(incomingData, []);
      }
      existingData.get(incomingData)?.push(row);
    }
  }

  // Add warnings for duplicates
  checkDuplicates(
    map: Map<string, number[]>,
    colIndex: number,
    fieldName: string,
    type: 'error' | 'warning'
  ): void {
    map.forEach((rows, value) => {
      if (rows.length > 1) {
        rows.forEach(row => {
          this.fieldErrors.push({ row: row, col: colIndex, message: `Duplicate ${fieldName}: "${value}"`, type: type });
        });
      }
    });
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

  get users(): Users {
    const COLUMNS: string[] = [];
    const USERS: Users = {} as Users;
    USERS.companyId=this.company.id;
    USERS.departmentName = this.departmentName;
    USERS.users = [];
    this.jsonData.map((data) => {
      if (data == this.jsonData[0]) {
        data.map((cell: string) => {
          COLUMNS.push(cell);
        });
      } else {
        const USER: User = {} as User;
        data.map((cell: any, index: number) => {
          switch (this.formatToCommonCase(COLUMNS[index])) {
            //
            case "staffid":
              USER.staffId = cell;
              break;
            case "telegramusername":
              USER.telegramUsername = cell;
              break;
            case "email":
              USER.email = cell;
              break;
            case "nrc":
              USER.nrc = cell;
              break;
            case "name":
              USER.name = cell;
              break;
            case "position":
            case "rank":
              USER.role = (() => {
                switch (this.formatToCommonCase(cell)) {
                  case "admin":
                    return 'ADMIN';
                  case "mainhr":
                    return 'MAIN_HR';
                  case "mainhrassistance":
                    return 'MAIN_HR_ASSISTANCE';
                  case "hr":
                    return 'HR';
                  case "hrassistance":
                    return 'HR_ASSISTANCE';
                  default:
                    return 'STAFF';
                }
              })();
              break;
            case "dateofbirth":
              USER.dob = cell;
              break;
            case "address":
              USER.address = cell;
              break;
            case "gender":
              if (this.formatToCommonCase(cell) == 'male') {
                USER.gender = 'MALE';
              } else {
                USER.gender = 'FEMALE';
              }
              break;
            //
          }
        });
        USERS.users.push(USER);
      }
    });
    return USERS;
  }

  formatToCommonCase(input: string): string {
    return input.trim().toLowerCase().replaceAll(" ", "").replaceAll("-", "").replaceAll("_", "");
  }
}
