import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { AnnouncementTarget } from 'src/app/modules/announcement-target';
import { CustomTergetGroup } from 'src/app/modules/custom-target-group';
import { CustomTargetGroupService } from 'src/app/services/custom-target-group/custom-target-group.service';

@Component({
  selector: 'app-custom-group-list',
  templateUrl: './custom-group-list.component.html',
})
export class CustomGroupListComponent implements OnInit {
  @ViewChild('filter') filter!: ElementRef;

  list: CustomTergetGroup[] = [];
  selectedItem: CustomTergetGroup;
  constructor(
    public customTargetService: CustomTargetGroupService,
  ) { }

  ngOnInit(): void {
    this.customTargetService.findAllByHRID().subscribe({
      next: (data) => {
        console.log(data);
        this.list = data;
      }
    });
  }

  showEntities(entity: CustomTergetGroup): void {
    console.log(entity);
    this.selectedItem = entity;
    this.selectedItem.customTargetGroupEntities.forEach((entiry, index) => {
      this.customTargetService.findReceiverName(entiry.receiverType, entiry.sendTo).subscribe({
        next: (targetName) => {
          this.selectedItem.customTargetGroupEntities[index].receiverName = targetName.STRING_RESPONSE;
        },
        complete:()=>{
          if(this.selectedItem.customTargetGroupEntities[((this.selectedItem.customTargetGroupEntities.length)-1)].receiverName!=null){
            this.customTargetService.showEntity = true;
          }
        }
      });
    });
   
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

}
