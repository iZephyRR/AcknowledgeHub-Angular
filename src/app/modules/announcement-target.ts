export interface AnnouncementTarget {
    id?: number;
    sendTo: number;
    receiverName? : string;
    receiverType: 'DEPARTMENT' | 'COMPANY' | 'EMPLOYEE' | 'CUSTOM';
}