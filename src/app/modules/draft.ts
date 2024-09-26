import { ContentType } from "../constants";
import { AnnouncementTarget } from "./announcement-target";

export interface Draft {
    id: number;
    title : string;
    file : File;
    fileUrl:string;
    filename : string;
    categoryId : number;
    categoryName : string;
    contentType: ContentType;
    draftAt:Date | string;
    target?: AnnouncementTarget[];
}