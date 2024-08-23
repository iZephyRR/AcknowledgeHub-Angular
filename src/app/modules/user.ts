type Role = 'ADMIN' | 'MAIN_HR' | 'MAIN_HR_ASSISTANT' | 'HR' | 'HR_ASSISTANT' | 'STAFF'
type Status ='ACTIVATED'| 'DEACTIVATED' | 'DEPARTED'
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
    staffid:string;
    telegramuserid:string;
    telegramusername:string;
    photolink:string;
    status:Status;
  
}