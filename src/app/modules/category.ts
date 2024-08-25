
export type Status ='ACTIVE'| 'SOFT_DELETE' 
export interface Category {
    id : number;
    name : string;
    status: Status;
}
