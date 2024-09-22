import { SafeUrl } from "@angular/platform-browser";

export interface Reply {
    content : string;
    commentId: number;
}

export interface ReplyList {
    id : number;
    replierName : string;
    replyCreatedAt: Date;
    replyContent : string;
    replierPhotoLink:string;
    safePhotoLink: SafeUrl;
}