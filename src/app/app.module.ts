import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AppComponent } from './app.component';

import { LocationStrategy, PathLocationStrategy } from '@angular/common';

import { AuthGuard } from './guards/auth.guard';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { AppLayoutModule } from './layout/app.layout.module';
import { AppRoutingModule } from './app-routing.module';

import { MessageService } from 'primeng/api';
import { AuthInterceptor } from './interceptors/auth/auth.interceptor';
import { TreeModule } from 'primeng/tree';

@NgModule({
  declarations: [
    AppComponent,
    NotfoundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AppLayoutModule,
    ToastModule,
    MessagesModule,
    TreeModule
  ],
  providers: [
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    AuthGuard,
    MessageService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
