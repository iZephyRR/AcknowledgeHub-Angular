import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeDemoComponent } from './treedemo.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule
	],
	declarations: [TreeDemoComponent],
})
export class TreeDemoModule { }
