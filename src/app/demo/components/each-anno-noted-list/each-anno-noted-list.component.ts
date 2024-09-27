import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { NotedPreview, NotedPreview2 } from 'src/app/modules/noted-models';
import { AnnouncementService } from 'src/app/services/announcement/announcement.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface link {
    label: string;
    data: any;
}

@Component({
    selector: 'app-each-anno-noted-list',
    templateUrl: './each-anno-noted-list.component.html'
})

export class EachAnnoNotedListComponent implements OnInit {

    @ViewChild('filter') filter!: ElementRef;
    @Input() announcementId: bigint;
    notedlist: NotedPreview2;
    showingList: NotedPreview2 = {} as NotedPreview2;
    links: link[] = [];
    timeRangeOptions: link[] = [
        { label: 'All Time', data: 'ALL_TIME' },
        { label: '1 Hour', data: 60 * 60 },
        { label: '1 Day', data: 24 * 60 * 60 },
        { label: '1 Week', data: 7 * 24 * 60 * 60 },
        { label: 'Custom', data: 'CUSTOM' },
        //{ label: 'Passed deadline', data: 'PASS_DEADLINE' }
    ];
    customData: { year: number, day: number, hour: number, minute: number } = {} as { year: number, day: number, hour: number, minute: number };
    displayCustomDialog: boolean = false;

    // Variables to hold custom date and time inputs


    constructor(
        public announcementService: AnnouncementService
    ) { }
    ngOnInit(): void {
        this.refreshData(BigInt(0));
        // this.notedlist = {} as NotedPreview2;
        // this.notedlist.receiverName = 'All Company';
        // this.notedlist.notedProgress = 35;
        // this.notedlist.childPreviews = [];
        // const ace: NotedPreview2 = {} as NotedPreview2;
        // ace.receiverName = 'ACE';
        // ace.receiverType = 'COMPANY'
        // ace.notedProgress = 100;
        // ace.childPreviews = [];
        // const cobol: NotedPreview2 = {} as NotedPreview2;
        // cobol.receiverName = 'Cobol';
        // cobol.receiverType = 'DEPARTMENT'
        // cobol.notedProgress = 62;
        // ace.childPreviews.push(cobol);
        // const java: NotedPreview2 = {} as NotedPreview2;
        // java.receiverName = 'Java';
        // java.receiverType = 'DEPARTMENT'
        // java.notedProgress = 85;
        // ace.childPreviews.push(java);
        // this.notedlist.childPreviews.push(ace);
        // const dat: NotedPreview2 = {} as NotedPreview2;
        // dat.receiverName = 'DAT';
        // dat.receiverType = 'COMPANY'
        // dat.notedProgress = 0;
        // this.notedlist.childPreviews.push(dat);
        // this.showingList = this.notedlist;
    }

    refreshData(duration: bigint): void {
        this.showingList = {} as NotedPreview2;
        this.announcementService.getNotedList(this.announcementId, duration).subscribe({
            next: (data) => {
                this.notedlist = data;
                this.showingList = this.notedlist;
                this.links = [];
                this.links.push({ label: this.showingList.receiverName, data: this.showingList });

            },
            error: (err) => {
                console.error(err);
            }
        });
    }

    openChild(notedlist: NotedPreview2): void {
        if (notedlist.receiverType !== 'EMPLOYEE') {
            const simpleLink = { label: notedlist.receiverName, data: notedlist };
            this.showingList = notedlist;
            const linkExists = this.links.some(l => l.label === simpleLink.label && l.data === simpleLink.data);
            if (!linkExists) {
                this.links.push(simpleLink);
            } else {
                let simpleIndex: number;
                this.links.forEach((link, index) => {
                    if (link.data == simpleLink.data && link.label == simpleLink.label) {
                        simpleIndex = index;
                    }
                });
                this.links = this.links.filter((data, index) => simpleIndex >= index);
            }
        }
    }


    back(): void {
        this.announcementService.showNotedReport = false;
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }


    onTimeRangeChange(event: any): void {
        console.log('event data ', event.value.data);
        if (event.value.data == 'CUSTOM') {
            this.displayCustomDialog = true;
        } else if (event.value.data == 'ALL_TIME') {
            this.refreshData(BigInt(0));
        }
        //  else if(event.value.data == 'PASS_DEADLINE'){
        //     this.refreshData(BigInt(-1));
        // }
        else{
            this.refreshData(BigInt(event.value.data));
        }
    }

    submitCustomTime(): void {
        let secounds: bigint = BigInt(0);
        console.log(secounds);
        
        if (this.customData.year > 0) {
            secounds += BigInt(this.customData.year) * BigInt(365) * BigInt(24) * BigInt(60) * BigInt(60);
        }
        console.log(secounds);
        
        if (this.customData.day > 0) {
            secounds += BigInt(this.customData.day) * BigInt(24) * BigInt(60) * BigInt(60);
        }
        console.log(secounds);
        
        if (this.customData.hour > 0) {
            secounds += BigInt(this.customData.hour) * BigInt(60) * BigInt(60);
        }
        console.log(secounds);
        
        if (this.customData.minute > 0) {
            secounds += BigInt(this.customData.minute) * BigInt(60);
        }
        
        this.refreshData(secounds);
        this.displayCustomDialog = false;
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
        //   doc.setProperties({
        //     title: `Employees Who Noted from ${this.showingList.receiverName}`,
        //     subject: `List of employees who noted for Announcement ID: ${this.announcementId}`,
        //     author: 'ACE Group',
        //     keywords: `employees, noted, pdf, announcementId: ${this.announcementId}`,
        //     creator: 'AcknowledgeHub'
        //   });
    
          // Add header
          doc.setFontSize(15);
          doc.text(`Noted list from ${this.showingList.receiverName} ${this.showingList.receiverType==null?'':this.showingList.receiverType}`, 14, 18);
          doc.setFontSize(15);
            doc.text(`List of employees who noted for Announcement ID: ${this.announcementId}`,14,26);
          // Add timestamp
          const currentDate = new Date();
          doc.setFontSize(10);
          doc.text(`Generated on: ${currentDate.toLocaleString()}`, 14, 32);
    
          // Define table header and data
          const head = [['No', 'Name', 'Noted percentage']];
          const data = this.showingList.childPreviews.map((list, index) => [
            index + 1,
        
           list.receiverName,
           list.notedProgress+"%"
          ]);
    
          // Add table with styling
          autoTable(doc, {
            startY: 34,
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
