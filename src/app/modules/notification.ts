export interface Notification {
    id: string;
    message?: string;
    noticeAt: string;
    isRead: boolean;
    announcementId?: number; // Add this property
    sender: string; // Correct the property name from 'Sender' to 'sender'
    senderName: string; // Correct the property name from 'SenderName' to 'senderName'
    category: string;
    sentTo: string;
    status: 'REQUESTED' | 'APPROVED' | 'DECLINED'; // Add this property
    type: string;
    userId: string;
    targetId: string;
    timestamp?: any;
  }
