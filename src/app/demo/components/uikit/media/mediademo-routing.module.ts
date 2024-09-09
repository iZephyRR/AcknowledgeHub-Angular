import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MediaDemoComponent } from './mediademo.component';
import { PanelsDemoComponent } from '../panels/panelsdemo.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: MediaDemoComponent },
	])],
	exports: [RouterModule]
})
export class MediaDemoRoutingModule { }
