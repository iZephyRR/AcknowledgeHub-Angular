import { Department } from "./department";

export interface Company {
    id : number;
    name : string;
    departments: Department[];
}