import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AuthGuard } from './guards/auth.guard';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { ProfileModule } from './demo/components/profile/profile.module';
import { AppLayoutModule } from './layout/app.layout.module'; // Ensure this path is correct
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { MessageService } from 'primeng/api';
import { AuthInterceptor } from './interceptors/auth/auth.interceptor';
import { TreeModule } from 'primeng/tree';
import { LoadingComponent } from './demo/components/uikit/loading/loading.component';';
import { environment } from './demo/enviroments/environment';

@NgModule({
  declarations: [
    AppComponent,
    NotfoundComponent,

     // Declare NotificationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AppLayoutModule,  // Import your layout module
    ToastModule,
    MessagesModule,
    TreeModule,
    LoadingComponent,
    MatTreeModule, // Angular Material modules
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
   
    AngularFireModule.initializeApp(environment.firebaseConfig), // Initialize Firebase
    AngularFirestoreModule, // Firestore module
    ProfileModule
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy },
      // CountryService,
      // EventService,
      // IconService,
      // NodeService,
      // PhotoService,
      // ProductService, 
      AuthGuard,
      MessageService,
     // WebSocketService,
    { 
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true 
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
