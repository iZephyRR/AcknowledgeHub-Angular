import { Role, Status } from "../constants";

export interface Representative {
    name?: string;
    image?: string;
}

export interface User {
    id: bigint;
    name: string;
    email:string;
    address:string;
    password:string;
    gender:string;
    dateofbirth:Date;
    nrc:string;
    role:Role;
    company:number;
    department:bigint;
    workentrydate:Date;
    stuffId:string;
    telegramuserid:string;
    telegramusername:string;
    photolink:string;
    status:Status;
    notedAt:string;
    companyName:string;
    departmentName:string;

}
export interface UserProfile {
    employee: User;
    companyName: string;
    departmentName: string;
  }
