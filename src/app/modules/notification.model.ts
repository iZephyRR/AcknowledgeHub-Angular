export interface Notification {
  id: string;
  message?: string;
  noticeAt: string;
  isRead: boolean;
  announcementId?: string;
  Sender: string;
  SenderName: string;
  SenderId: string;
  category: string;
  sentTo: string;
  status: 'NOTED' | 'NEW' | 'UPLOADED';
  type: string;
  userId: string;
  targetId: string;
  timestamp?: string;
  targetName?: string[];
  title:string
}