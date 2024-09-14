import { Injectable } from '@angular/core';
import { Gender, Role, Status } from 'src/app/constants';
import { Company } from 'src/app/modules/company';
import { Department } from 'src/app/modules/department';
import { User } from 'src/app/modules/user';
import { Users } from 'src/app/modules/user-excel-upload';
import * as XLSX from 'xlsx';

interface FieldError {
  row: number;
  col: number;
  message: string;
  type: 'error' | 'warning' | 'changed' | 'cannot_be_change';
}

@Injectable({
  providedIn: 'root'
})
export class EditDepartmentService {
  showView: boolean;
  apiData: string[][] = [];
  showData: string[][] = [];
  fieldErrors: FieldError[] = [];
 // company: Company;
  department: Department;
  hasError: boolean;
  constructor() { }

  onFileChange(event: any) {
    const file = event.target.files[0];
    let excelData: string[][] = [];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        excelData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
          dateNF: 'yyyy-mm-dd'
        });
        const headers: string[] = excelData[0];
        excelData = excelData.filter((data, index) => index > 0 && data.length > 0);
        let userData: User[] = [];
        excelData.forEach((user, userIndex) => {
          userData[userIndex] = {} as User;
          headers.forEach((header, headerIndex) => {
            if (this.formatToCommonCase(header) == 'name') {
              userData[userIndex].name = user[headerIndex];
            }
            if (this.formatToCommonCase(header) == 'staffid') {
              userData[userIndex].staffId = user[headerIndex];
            }
            if (this.formatToCommonCase(header) == 'email') {
              userData[userIndex].email = user[headerIndex];
            }
            if (this.formatToCommonCase(header) == 'telegramusername') {
              userData[userIndex].telegramUsername = user[headerIndex];
            }
            if (this.formatToCommonCase(header) == 'nrc') {
              userData[userIndex].nrc = user[headerIndex];
            }
            if (this.formatToCommonCase(header) == 'gender') {
              userData[userIndex].gender = user[headerIndex] as Gender;
            }
            if (this.formatToCommonCase(header) == 'address') {
              userData[userIndex].address = user[headerIndex];
            }
            if (this.formatToCommonCase(header) == 'status') {
              userData[userIndex].status = user[headerIndex] as Status;
            }
            if (this.formatToCommonCase(header) == 'position') {
              userData[userIndex].role = user[headerIndex] as Role;
            }
          });
        });
        this.showData = this.typeConvertor(userData);
        this.validateData();
      };
      reader.readAsArrayBuffer(file);
    }
  }

  getFieldError(rowIndex: number, colIndex: number): FieldError | null {
    return this.fieldErrors.find(e => e.row === rowIndex && e.col === colIndex) || null;
  }

  updateCellValue(rowIndex: number, colIndex: number, event: any) {
    const newValue = event.target.value;
    this.showData[rowIndex + 1][colIndex] = newValue;

    this.fieldErrors = this.fieldErrors.filter(e => e.row !== rowIndex + 1 || e.col !== colIndex);

    //this.validateData(this.showData);
  }

  insertFromApi(users: User[]): void {
    const strUsers: string[][] = this.typeConvertor(users);
    this.apiData = strUsers;
    this.showData = strUsers;
    this.validateData();
  }

  validateData(): void {
    this.hasError = false;
    this.fieldErrors = [];
    this.showData.forEach((row: string[], rowIndex: number) => {
      row.forEach((cell: string, cellIndex: number) => {
        if (cell === null || cell === undefined || cell === '') {
          this.fieldErrors.push({ row: rowIndex, col: cellIndex, message: `${this.showData[0][cellIndex]} is required.`, type: 'error' });
          this.hasError = true;
        } else {
          if (!(this.apiData[rowIndex][cellIndex] === null || this.apiData[rowIndex][cellIndex] === undefined || this.apiData[rowIndex][cellIndex] === '')) {
            if (cell.toLowerCase() != this.apiData[rowIndex][cellIndex].toLowerCase()) {
              this.fieldErrors.push({ row: rowIndex, col: cellIndex, message: `${this.showData[0][cellIndex]} is changed from ${this.apiData[rowIndex][cellIndex]} to ${cell}`, type: 'changed' })
            }
          }
        }

      });
    });
    if(this.apiData.length>this.showData.length){
      for(let i=this.showData.length;i<this.apiData.length;i++){
        this.showData[i] = this.apiData[i];
      }
    }
  }

  typeConvertor(data: User[]): string[][] {
    const convertedData: string[][] = [];
    convertedData[0] = [];
    convertedData[0].push('Name');
    convertedData[0].push('Staff-ID');
    convertedData[0].push('Email');
    convertedData[0].push('Telegram Username');
    convertedData[0].push('NRC');
    convertedData[0].push('Gender');
    // convertedData[0].push('Date of Birth');
    convertedData[0].push('Address');
    // convertedData[0].push('Entry Date');
    convertedData[0].push('Status');
    convertedData[0].push('Position');
    data.forEach((user: User, index: number) => {
      convertedData[index + 1] = [];
      convertedData[index + 1].push(user.name);
      convertedData[index + 1].push(user.staffId);
      convertedData[index + 1].push(user.email);
      convertedData[index + 1].push(user.telegramUsername);
      convertedData[index + 1].push(user.nrc);
      convertedData[index + 1].push(user.gender);
      // convertedData[index + 1].push(null);
      //console.log(user.dob==null?'null':user.dob);
      convertedData[index + 1].push(user.address);
      // convertedData[index + 1].push(null);
      // console.log(user.workEntryDate);
      convertedData[index + 1].push(user.status);
      convertedData[index + 1].push(user.role);
    });
    return convertedData;
  }

  formatToCommonCase(input: string): string {
    return input.trim().toLowerCase().replaceAll(" ", "").replaceAll("-", "").replaceAll("_", "");
  }

  get users(): Users {
    const COLUMNS: string[] = [];
    const USERS: Users = {} as Users;
   // USERS.companyId = this.company.id;
    // USERS.departmentName = this.departmentName;
    USERS.users = [];
    this.showData.map((data) => {
      if (data == this.showData[0]) {
        data.map((cell: string) => {
          COLUMNS.push(cell);
        });
      } else {
        const USER: User = {} as User;
        data.map((cell: any, index: number) => {
          switch (this.formatToCommonCase(COLUMNS[index])) {
            case "stuffid":
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
            case "role":
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
            case "entrydate":
              USER.workEntryDate = cell;
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
}
