import { ContentType } from "../constants";


export interface Announcement {
    id:number;
    created_at:Date;
    file : string;
    title : string;
    categoryName : string;
    creater: string;
    contentType: ContentType;
}