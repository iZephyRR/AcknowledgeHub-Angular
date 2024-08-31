export interface AnnouncementTarget {
    id?:number;
    sendTo:number;
    receiverType:'DEPARTMENT'|'COMPANY'|'EMPLOYEE';
}