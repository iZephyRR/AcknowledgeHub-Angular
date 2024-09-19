import { Component, OnInit, signal } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { ScheduleList } from 'src/app/modules/announcement';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import { MessageDemoService } from 'src/app/services/message/message.service';

@Component({
    templateUrl: './inputdemo.component.html'
})
export class InputDemoComponent  {
  // signal([] as Draft[])

      groupedAnnouncements = [];
      scheduleLists= signal([] as ScheduleList[]);

      constructor(private announcementService : AnnouncementService,
        private messageService : MessageDemoService
      ) {
        this.groupAnnouncementsByDate();
      }

      groupAnnouncementsByDate() {
        const groupMap = new Map<string, { date: Date, announcements: any[] }>();
      
        this.announcementService.getScheduleList().subscribe(data => {
          console.log("Original list: ", data);
      
          // Parse and map the announcements, converting 'createdAt' into proper Date objects
          const parsedAnnouncements = data.map(announcement => ({
            ...announcement,
            createdAt: this.parseDate(announcement.createdAt)
          }));
      
          // Group announcements by the same date (ignoring time)
          parsedAnnouncements.forEach(announcement => {
            if (!announcement.createdAt) {
              console.warn('Invalid or null date for announcement:', announcement);
              return;  // Skip invalid date
            }
      
            // Group by date part only (ignore the time)
            const dateKey = announcement.createdAt.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
            if (!groupMap.has(dateKey)) {
              groupMap.set(dateKey, { date: announcement.createdAt, announcements: [] });
            }
      
            // Add announcement to the correct date group
            groupMap.get(dateKey)?.announcements.push(announcement);
          });
      
          // Convert the Map to an array for displaying grouped announcements
          this.groupedAnnouncements = Array.from(groupMap.values());
      
          console.log("Grouped Announcements: ", this.groupedAnnouncements);
        });
      }

      deleteSchedule(announcementId: number) {
        console.log("announcement : ", announcementId);
        this.announcementService.deleteScheduleAnnoucement(announcementId)
          .pipe(
            
          )
          .subscribe({
            next: (response) => {
              this.messageService.toast("success",response.STRING_RESPONSE);
              this.groupAnnouncementsByDate();
            },
            error: (error: any) => {
              this.messageService.toast("error","Something is wrong");
            }
          });
    }
    

    parseDate(dateInput: any): Date | null {
      let parsedDate: Date;
    
      // Handle array date format (e.g., [2024, 8, 19, 15, 30] -> year, month-1, day, hours, minutes)
      if (Array.isArray(dateInput)) {
        parsedDate = new Date(
          dateInput[0], 
          dateInput[1] - 1, // JavaScript months are 0-indexed
          dateInput[2], 
          dateInput[3] || 0, // Optional hours
          dateInput[4] || 0  // Optional minutes
        );
      } else {
        parsedDate = new Date(dateInput);
      }
    
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      } else {
        console.warn('Invalid date string:', dateInput);
        return null;
      }
    }
}
