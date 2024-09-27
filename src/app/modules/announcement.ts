import { AnnouncementResponseCondition, AnnounementSelectAll, ContentType, Role } from "../constants";


export interface Announcement {
    pdfLink: string;
    id: number;
    file: string;
    title: string;
    categoryName: string;
    creater: string;
    createdBy: string;  // Update this
    contentType: ContentType;
    createdAt: Date | string;
    companyName:string;
    announcementResponseCondition: AnnouncementResponseCondition;
    selectAll : AnnounementSelectAll;
    deadline: Date;
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

export interface TargetDTO {
    id: number;
    ReceiverType: string;
    sentTo: number;
  }

