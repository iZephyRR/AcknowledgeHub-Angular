import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AuthGuard } from './guards/auth.guard';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { AppLayoutModule } from './layout/app.layout.module';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { MessageService } from 'primeng/api';
import { AuthInterceptor } from './interceptors/auth/auth.interceptor';
import { TreeModule } from 'primeng/tree';
import { LoadingComponent } from './demo/components/uikit/loading/loading.component';
import { environment } from './demo/enviroments/environment';
import { ProgressBarComponent } from './demo/components/uikit/progress-bar/progress-bar.component';
import { ProgressBarModule } from 'primeng/progressbar';
import { SystemSettingsComponent } from './demo/components/system-settings/system-settings.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './demo/components/auth/login/login.component';
import { PasswordModule } from 'primeng/password';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { DashboardComponent } from './demo/components/dashboard/dashboard.component';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { DepartmentsComponent } from './demo/components/departments/departments.component';
import { InputTextModule } from 'primeng/inputtext';
import { DepartmentComponent } from './demo/components/department/department.component';
import { UserUploadValidatorComponent } from './demo/components/user-upload-validator/user-upload-validator.component';
import { SliderModule } from 'primeng/slider';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { EditDepartmentComponent } from './demo/components/edit-department/edit-department.component';

@NgModule({
  declarations: [
    AppComponent,
    NotfoundComponent,
    LoadingComponent,
    ProgressBarComponent,
    SystemSettingsComponent,
    LoginComponent,
    DashboardComponent,
    DepartmentsComponent,
    DepartmentComponent,
    UserUploadValidatorComponent,
    EditDepartmentComponent
  ],
  imports: [
    AppRoutingModule,
    AppLayoutModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    BrowserModule,
    BrowserAnimationsModule,
    ButtonModule,
    CommonModule,
    ChartModule,
		TooltipModule,
    MessagesModule,
    ProgressBarModule,
    ToastModule,
    TreeModule,
    FormsModule,
    RippleModule,
    InputSwitchModule,
    InputTextModule,
    PasswordModule,
    DialogModule,
    FormsModule,
    MenuModule,
    TableModule,
    StyleClassModule,
    PanelMenuModule,
		ButtonModule,
		SliderModule,
		ToggleButtonModule,
		MultiSelectModule,
		DropdownModule
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
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
