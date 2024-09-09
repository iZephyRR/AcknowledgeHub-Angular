import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanelsDemoComponent } from './panelsdemo.component';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PanelsDemoRoutingModule } from './panelsdemo-routing.module';
import { TableModule } from 'primeng/table';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		PanelsDemoRoutingModule,
		AutoCompleteModule,  // Include AutoCompleteModule here
    	ButtonModule,
        TableModule,
        

	],
	declarations: [PanelsDemoComponent]
})
export class PanelsDemoModule { }
