import { ContentType } from "../constants";


export interface Announcement {
    pdfLink(pdfLink: any): unknown;
    id:number;
    file : string;
    title : string;
    categoryName : string;
    creater: string;
    contentType: ContentType;
    createdAt:Date;
}
export enum FileType {
    AUDIO = 'AUDIO',
    EXCEL = 'EXCEL',
    IMAGE = 'IMAGE',
    PDF = 'PDF',
    VIDEO = 'VIDEO'
  }


  