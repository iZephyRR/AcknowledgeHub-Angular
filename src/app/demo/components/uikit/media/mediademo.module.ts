import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaDemoComponent } from './mediademo.component';
import { MediaDemoRoutingModule } from './mediademo-routing.module';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { GalleriaModule } from 'primeng/galleria';
import { CarouselModule } from 'primeng/carousel';
import { DialogModule } from 'primeng/dialog';

@NgModule({
	imports: [
		CommonModule,
		MediaDemoRoutingModule,
		ButtonModule,
		ImageModule,
		GalleriaModule,
		CarouselModule,
		DialogModule
	],
	declarations: [MediaDemoComponent]
})
export class MediaDemoModule { }
