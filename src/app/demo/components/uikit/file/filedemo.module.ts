import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { FileDemoRoutingModule } from './filedemo-routing.module';
import { FileDemoComponent } from './filedemo.component';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TreeModule } from 'primeng/tree';
import { DialogModule } from 'primeng/dialog';

import { ButtonModule } from 'primeng/button';


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		FileDemoRoutingModule,
		FileUploadModule,
		TableModule,
		ToastModule,
		
        DialogModule, // Add DialogModule here
        ButtonModule, // Add ButtonModule if used
        TableModule, 
		TreeModule
	],
	declarations: [FileDemoComponent],
})
export class FileDemoModule { }
