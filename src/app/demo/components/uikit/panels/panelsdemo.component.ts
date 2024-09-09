import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Table } from 'primeng/table';
import { Announcement } from 'src/app/modules/announcement';
import { User } from 'src/app/modules/user';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import { UserService } from 'src/app/services/user/user.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  templateUrl: './panelsdemo.component.html'
})
export class PanelsDemoComponent implements OnInit {
    users : User[] = [];

  announcementId: string;
  announcementTitle: string = '';
  constructor(private userService: UserService,private announcementService: AnnouncementService,

    private route : ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.announcementId = this.route.snapshot.paramMap.get('id');
    //this.loadAnnouncementDetails(this.announcementId);
    this.getUsersWhoNotedWithinOneDay();
    // const currentUrl = this.route.snapshot.routeConfig?.path;
    // console.log("announcement id:", this.announcementId);
    // console.log("current url:", currentUrl);

    // if (currentUrl?.includes('notedOneDay')) {
    //     this.getUsersWhoNotedWithinOneDay();
    // } else if (currentUrl?.includes('notedThreeDay')) {
    //     this.getUsersWhoNotedWithinThreeDays();
    // }
  }
//   loadAnnouncementDetails(announcementId: string) {
//     // Fetch announcement details using the announcement service
//     this.announcementService.getAnnouncementById(announcementId).subscribe(data => {
//       this.announcementTitle = data.title; // Assuming the response contains the title
//       this.getUsersWhoNotedWithinOneDay(); // Fetch users after loading the announcement details
//     }, error => {
//       console.error('Error loading announcement details:', error);
//     });
//   }

  getUsersWhoNotedWithinOneDay() {
    this.userService.getUserWhoNotedWithInOneDay(this.announcementId).subscribe(data =>{
        this.users = data;
    });
  }

  getUsersWhoNotedWithinThreeDays() {
    this.userService.getUserWhoNotedWithInThreeDay(this.announcementId).subscribe(data =>{
        this.users = data;
    });
  }


  onGlobalFilter(table: Table, event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    table.filterGlobal(filterValue, 'contains');
  }
  downloadSmartPDF() {
    const doc = new jsPDF();
    const imgData = 'assets/layout/images/photo_2024-08-05_15-16-19.png';
    const imgWidth = 85; // You can adjust the width
    const imgHeight = 85; // You can adjust the height

    // Create a canvas to apply transparency
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = imgWidth;
    canvas.height = imgHeight;

    // Load the image
    const img = new Image();
    img.src = imgData;
    img.onload = () => {
      // Draw the image on the canvas with transparency
      ctx.globalAlpha = 0.2; // Set transparency
      ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

      // Convert canvas to image data
      const imgDataWithTransparency = canvas.toDataURL('image/png');

      // Calculate the position to center the image
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      // Add the image with transparency to the PDF
      doc.addImage(imgDataWithTransparency, 'PNG', x, y, imgWidth, imgHeight);

      // Add other content to the PDF
      doc.setProperties({
        title: `Employees Who Noted - ${this.announcementTitle}`,
        subject: `List of employees who noted for Announcement ID: ${this.announcementId}`,
        author: 'Your Company Name',
        keywords: `employees, noted, pdf, announcementId: ${this.announcementId}`,
        creator: 'Your Application Name'
      });

      // Add header
      doc.setFontSize(18);
      doc.text('Employees Who Noted', 14, 22);

      // Add timestamp
      const currentDate = new Date();
      doc.setFontSize(10);
      doc.text(`Generated on: ${currentDate.toLocaleString()}`, 14, 28);

      // Define table header and data
      const head = [['No', 'Staff Id', 'NotedAt', 'Name', 'Gender', 'Role', 'Department', 'Company']];
      const data = this.users.map((user, index) => [
        index + 1,
        user.stuffId, // Fixed typo
        user.notedAt,
        user.name,
        user.gender,
        user.role,
        user.departmentName,
        user.companyName
      ]);

      // Add table with styling
      autoTable(doc, {
        startY: 32,
        head: head,
        body: data,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 32 },
        didDrawPage: (data) => {
          // Footer with page number
          const pageCount = doc.getNumberOfPages();
          doc.setFontSize(10);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            doc.internal.pageSize.getWidth() - 30, // Adjusted for better positioning
            doc.internal.pageSize.getHeight() - 10
          );
        }
      });

      // Save the PDF with a dynamic filename
      doc.save(`Employees_Who_Noted_${this.announcementId}_${currentDate.toISOString().slice(0, 10)}.pdf`);
    };
  }
}

