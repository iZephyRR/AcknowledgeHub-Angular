import { SafeUrl } from "@angular/platform-browser";

export interface Comment {
    content : string;
    announcementId: number;
}

export interface CommentList {
    author : string;
    createdAt: Date;
    content : string;
    announcementId: number;
    photoLink:string;
    safePhotoLink: SafeUrl;
}