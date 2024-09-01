import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FloatLabelDemoComponent } from './floatlabeldemo.component';
import { FloatlabelDemoRoutingModule } from './floatlabeldemo-routing.module';
@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		FloatlabelDemoRoutingModule,


	],
	declarations: [FloatLabelDemoComponent]
})
export class FloatlabelDemoModule { }
