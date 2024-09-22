import { Injectable } from '@angular/core';
import { Gender, Role, Status } from 'src/app/constants';
import { Company } from 'src/app/modules/company';
import { Department } from 'src/app/modules/department';
import { User } from 'src/app/modules/user';
import { UpdateUser, Users } from 'src/app/modules/user-excel-upload';
import * as XLSX from 'xlsx';
import { MessageDemoService } from '../message/message.service';
import { UserService } from '../user/user.service';
import { UniqueFields } from 'src/app/modules/unique-fields';

interface FieldError {
  row: number;
  col: number;
  message: string;
  type: 'error' | 'warning' | 'changed' | 'disable';
}

interface RowError {
  row: number;
  message: string;
  type: 'error' | 'warning' | 'new';
}

@Injectable({
  providedIn: 'root'
})
export class EditDepartmentService {
  showView: boolean;
  private apiData: string[][] = [];
  showData: string[][] = [];
  fieldErrors: FieldError[] = [];
  rowErrors: RowError[] = [];
  department: Department;
  hasError: boolean;
  isChange: boolean;
  idContainer: Map<string, {id:bigint, status:Status}> = new Map<string, {id:bigint, status:Status}>();
  constructor(
    private messageService: MessageDemoService,
    private userService: UserService
  ) { }

  onFileChange(event: any) {
    this.isChange = true;
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
        let userData: UpdateUser[] = [];
        excelData.forEach((user, userIndex) => {
          userData[userIndex] = {} as UpdateUser;
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

  getRowError(rowIndex: number): RowError | null {
    return this.rowErrors.find(e => e.row === rowIndex) || null;
  }


  updateCellValue(rowIndex: number, colIndex: number, event: any) {
    this.isChange = true;
    const newValue = event.target.value;
    this.showData[rowIndex + 1][colIndex] = newValue;
    this.fieldErrors = this.fieldErrors.filter(e => e.row !== rowIndex + 1 || e.col !== colIndex);
    this.validateData();
  }

  insertFromApi(users: UpdateUser[]): void {
    const strUsers: string[][] = this.typeConvertor(users);
    this.apiData = strUsers;
    this.showData = strUsers;
    users.forEach((user) => {
      this.idContainer.set(user.staffId, {id:user.id,status:user.status});
    });
    this.validateData();
  }

  private validateData(): void {
    let uniqueFields: UniqueFields;
    this.userService.getUniqueFields().subscribe({
      next: (data) => {
        uniqueFields = data;
      },
      complete: () => {
        this.hasError = false;
        this.fieldErrors = [];
        const headers = this.showData[0];
        headers.forEach((header, headerIndex) => {
          if (this.formatToCommonCase(header) == 'staffid') {
            const apiStaffes: string[] = [];
            const showStaffes: string[] = [];
            this.apiData.slice(1).forEach((data) => {
              apiStaffes.push(data[headerIndex]);
            });
            this.showData.slice(1).forEach((data) => {
              showStaffes.push(data[headerIndex]);
            });
            //Deleted staff
            const deletedStaffes: string[] = [];
            apiStaffes.forEach((staff, index) => {
              if (!showStaffes.includes(staff)) {
                deletedStaffes.push(staff);
                const container=this.idContainer.get(staff);
                this.idContainer.set(staff,{id:container.id, status:'DEACTIVATED'});
                this.showData.push(this.apiData[index + 1]);
                this.rowErrors.push({ row: this.showData.indexOf(this.apiData[index + 1]), type: 'warning', message: 'This row of user account would be deactivate.' });
              }
            });
            //New staff
            const newStaffes: string[] = [];
            showStaffes.forEach((staff, index) => {
              if (!apiStaffes.includes(staff)) {
                newStaffes.push(staff);
                this.rowErrors.push({ row: index + 1, type: 'new', message: 'This row is a new user.' });
              }
            });
          }
        });
        this.showData.forEach((row, rowIndex) => {
          headers.forEach((header, headerIndex) => {

            if (row[headerIndex] === null || row[headerIndex] === undefined || row[headerIndex] === '') {
              this.fieldErrors.push({ row: rowIndex, col: headerIndex, message: `${header} is required.`, type: 'error' });
              this.hasError = true;
            }

            if (this.formatToCommonCase(header) == 'email') {
              const apiEmails: string[] = [];
              this.apiData.slice(1).forEach((data) => {
                apiEmails.push(data[headerIndex]);
              });

              if (uniqueFields.emails.includes(row[headerIndex]) && !apiEmails.includes(row[headerIndex])) {
                this.fieldErrors.push({ row: rowIndex, col: headerIndex, message: 'This email is already use by another employee.', type: 'error' });
                this.hasError = true;
              } else {
                this.checkDuplicate(rowIndex, headerIndex, row[headerIndex], 'email');
              }

            }

            if (this.formatToCommonCase(header) == 'nrc') {
              const apiNRCs: string[] = [];
              this.apiData.slice(1).forEach((data) => {
                apiNRCs.push(data[headerIndex]);
              });
              if (uniqueFields.nrcs.includes(row[headerIndex]) && !apiNRCs.includes(row[headerIndex])) {
                this.fieldErrors.push({ row: rowIndex, col: headerIndex, message: 'This NRC number is same as another employee.', type: 'error' });
                this.hasError = true;
              } else {
                this.checkDuplicate(rowIndex, headerIndex, row[headerIndex], 'NRC');
              }
            }

            if (this.formatToCommonCase(header) == 'staffid') {
              this.fieldErrors.push({ row: rowIndex, col: headerIndex, message: 'Staff-ID cannot be edit.', type: 'disable' });
            }
        
            if (this.formatToCommonCase(header) == 'telegramusername') {
              const apiTelegramusernames: string[] = [];
              this.apiData.slice(1).forEach((data) => {
                apiTelegramusernames.push(data[headerIndex]);
              });
              if (uniqueFields.telegramUsernames.includes(row[headerIndex]) && !apiTelegramusernames.includes(row[headerIndex])) {
                this.fieldErrors.push({ row: rowIndex, col: headerIndex, message: 'This telegram username is already use by another employee.', type: 'error' });
                this.hasError = true;
              } else {
                this.checkDuplicate(rowIndex, headerIndex, row[headerIndex], 'telegram username');
              }
            }
          });
        });
      },
      error: (err) => {
        this.messageService.toast('error', 'An error occurred when validate data.');
        console.error(err);
      }
    });
  }

  private checkDuplicate(rowIndex: number, columnIndex: number, cell: string, label: string): void {
    let count: number = 0;
    this.showData.forEach((inner) => {
      if (inner.includes(cell)) {
        count++
      }
    });
    if (count > 1) {
      this.fieldErrors.push({ row: rowIndex, col: columnIndex, message: 'Duplicated ' + label + ' ' + cell, type: 'error' });
      this.hasError = true;
    }
  }

  private typeConvertor(data: UpdateUser[]): string[][] {
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
    convertedData[0].push('Position');
    data.forEach((user: UpdateUser, index: number) => {
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
      convertedData[index + 1].push(user.role);
    });
    return convertedData;
  }

  private formatToCommonCase(input: string): string {
    return input.trim().toLowerCase().replaceAll(" ", "").replaceAll("-", "").replaceAll("_", "");
  }

  get users(): UpdateUser[] {
    const COLUMNS: string[] = [];
    const USERS: UpdateUser[] = [];
    this.showData.map((data) => {
      if (data == this.showData[0]) {
        data.map((cell: string) => {
          COLUMNS.push(cell);
        });
      } else {
        const USER: UpdateUser = {} as UpdateUser;
        data.map((cell: any, index: number) => {
          switch (this.formatToCommonCase(COLUMNS[index])) {
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
        USERS.push(USER);
      }
    });
    return USERS;
  }

}