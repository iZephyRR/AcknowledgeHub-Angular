import { Role, Status } from "../constants";

export interface Representative {
    name?: string;
    image?: string;
}

export interface User {
    employee: User;
    id: bigint;
    name: string;
    email: string;
    address: string;
    password: string;
    gender: string;
    dateofbirth: Date;
    nrc: string;
    role: Role;
    company: number;
    department: bigint;
    workentrydate: Date;
    staffid: string;
    telegramuserid: string;
    telegramusername: string;
    photolink: string;
    status: Status;

}
export interface UserProfile {
    employee: User;
    companyName: string;
    departmentName: string;
}