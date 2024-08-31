import { AnnouncementTarget } from "./announcement-target";

export interface Draft {
    id: number;
    title : string;
    file : File;
    fileUrl:string;
    filename : string;
    categoryId : number;
    categoryName : string;
    target?: AnnouncementTarget[];
}