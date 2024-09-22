import { AnnouncementResponseCondition, ContentType, Role } from "../constants";


export interface Announcement {
    pdfLink: string;
    id: number;
    file: string;
    title: string;
    categoryName: string;
    creater: string;
    contentType: ContentType;
    createdAt: Date;
    announcementResponseCondition: AnnouncementResponseCondition;
}
export enum FileType {
    AUDIO = 'AUDIO',
    EXCEL = 'EXCEL',
    IMAGE = 'IMAGE',
    PDF = 'PDF',
    VIDEO = 'VIDEO'
}

export interface ScheduleList {
    id : number;
    title : string;
    createdAt : Date;
    contentType: ContentType;
    countdown : string;
    role : Role;
}


