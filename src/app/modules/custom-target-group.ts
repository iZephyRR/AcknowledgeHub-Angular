import { AnnouncementTarget } from "./announcement-target";

export interface CustomTergetGroup {
    id?:number;
    title:string;
    customTargetGroupEntities:AnnouncementTarget[];
}