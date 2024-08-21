// app.module.ts or any other module
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ChartsDemoComponent } from './chartsdemo.component';
import { ChartsDemoRoutingModule } from './chartsdemo-routing.module';
import { CommonModule } from '@angular/common';


@NgModule({
  imports: [
    CommonModule,
    ChartsDemoRoutingModule// Import the standalone component here
  ],
  declarations: [ChartsDemoComponent]
})
export class ChartsDemoModule { }
