import { Department } from "./department";

export interface Company {
    id : number;
    name : string;
    departments?: Department[];
}

export interface HR{
    hrName: string;
    hrEmail: string;
    staffId: string;
    companyName:string;
}