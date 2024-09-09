import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AuthGuard } from './guards/auth.guard';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { ProfileModule } from './demo/components/profile/profile.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { MessageService } from 'primeng/api';
import { AuthInterceptor } from './interceptors/auth/auth.interceptor';
import { TreeModule } from 'primeng/tree';
import { LoadingComponent } from './demo/components/uikit/loading/loading.component';
import { environment } from './demo/enviroments/environment';
import { ReversePipe } from './reverse.pipe';  // Ensure correct import
import { NgxEchartsModule } from 'ngx-echarts';
import { NbThemeModule, NbLayoutModule } from '@nebular/theme';
import * as echarts from 'echarts';import { DashboardModule } from './demo/components/dashboard/dashboard.module';
import { RouterModule } from '@angular/router';
import { ProgressBarComponent } from './demo/components/uikit/progress-bar/progress-bar.component';
import { ProgressBarModule } from 'primeng/progressbar';
import { SafeUrlPipe } from './safe-url.pipe';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { AnnouncementDetailsComponent } from './demo/components/uikit/announcementdetails/announcementdetails.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    NotfoundComponent,
    LoadingComponent,
    ProgressBarComponent,
    SafeUrlPipe ,
    AnnouncementDetailsComponent,
    
  ],
  imports: [
		BadgeModule,
		ChipModule,
		ButtonModule,
    ProgressBarModule,
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AppLayoutModule,  // Import your layout module
    ToastModule,
    MessagesModule,
    TreeModule,
    AngularFireModule.initializeApp(environment.firebaseConfig), // Initialize Firebase
    AngularFirestoreModule, // Firestore module
    ProfileModule,
    DialogModule,
    FormsModule,
    // NgxExtendedPdfViewerModule,
     PdfViewerModule
    DashboardModule,
    NbLayoutModule,
    NgxEchartsModule.forRoot({ echarts }),
   // NgxExtendedPdfViewerModule,
   //  PdfViewerModule

  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy
    },
    AuthGuard,
    MessageService,

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
