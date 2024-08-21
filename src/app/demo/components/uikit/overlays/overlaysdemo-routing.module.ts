import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '',  }
	])],
	exports: [RouterModule]
})
export class OverlaysDemoRoutingModule { }
