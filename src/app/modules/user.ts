import { Gender, Role, Status } from "../constants";

export interface Representative {
    name?: string;
    image?: string;
}

export interface User {
    id?: bigint;
    name: string;
    email: string;
    address: string;
    gender: Gender;
    dob: Date;
    nrc: string;
    role: Role;
    companyId: bigint;
    departmentId: bigint;
    staffId: string;
    telegramUserId: string;
    telegramUsername: string;
    photoLink: string;
    status: Status;
    notedAt: string;
    companyName: string;
    departmentName: string;
}

export interface UserProfile {
    name: string;
    role: Role;
    email: string;
    companyName: string;
    departmentName: string;
    photoLink : string;
}

