import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIkitRoutingModule } from './uikit-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { ProgressBarModule } from 'primeng/progressbar';

@NgModule({
	imports: [
		ProgressBarModule,
		CommonModule,
		UIkitRoutingModule
		//BrowserModule
	]
})
export class UIkitModule {

 }
