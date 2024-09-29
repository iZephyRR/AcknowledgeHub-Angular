import { Gender, Role, Status } from "../constants";
import { CompanyRequest } from "./company";
import { User } from "./user";

export interface Users{
    companyId:bigint;
    companyName:string;
    departmentId:bigint;
    departmentName:string;
    users:User[];
}

export interface UpdateUser{
    id:bigint;
    name:string;
    email:string;
    departmentId:bigint;
    staffId:string;
    status:Status;
    role:Role;
    dob:string;
    telegramUsername:string;
    telegramUserId?:string;
    nrc:string;
    gender:Gender;
    address:string;
    notedCount:bigint;
}
