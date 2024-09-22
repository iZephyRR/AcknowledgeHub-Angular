import { Department } from "./department";

export interface Company {
    id: bigint;
    name: string;
    departments?: Department[];
}

export interface CompanyRequest {
    id: bigint;
    name: string;
}

export interface HR {
    hrName: string;
    hrEmail: string;
    staffId: string;
    companyName: string;
}