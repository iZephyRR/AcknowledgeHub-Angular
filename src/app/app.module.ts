import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AuthGuard } from './guards/auth.guard';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
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
import { SafeUrlPipe } from './safe-url.pipe';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { AnnouncementDetailsComponent } from './demo/components/uikit/announcementdetails/announcementdetails.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { SystemSettingsComponent } from './demo/components/system-settings/system-settings.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { LoginComponent } from './demo/components/auth/login/login.component';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
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
import { AppMenuitemComponent } from './layout/app.menuitem.component';
import { AppTopBarComponent } from './layout/app.topbar.component';
import { AppFooterComponent } from './layout/app.footer.component';
import { AppMenuComponent } from './layout/app.menu.component';
import { AppSidebarComponent } from './layout/app.sidebar.component';
import { AppLayoutComponent } from './layout/app.layout.component';
import { TimeAgoPipe } from './time-ago.pipe';
import { AddCompanyComponent } from './demo/components/add-company/add-company.component';
import { TableDemoComponent } from './demo/components/uikit/table/tabledemo.component';
import { RatingModule } from 'primeng/rating';
import { UserCardComponent } from './demo/components/user-card/user-card.component';
import { MediaDemoComponent } from './demo/components/uikit/media/mediademo.component';
import { CategoryComponent } from './demo/components/uikit/category/category.component';
import { AnnouncementreportComponent } from './demo/components/uikit/announcementreport/announcementreport.component';
import { EachAnnoNotedListComponent } from './demo/components/each-anno-noted-list/each-anno-noted-list.component';
import { SkeletonModule } from 'primeng/skeleton';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CalendarModule } from 'primeng/calendar';
import { ChipsModule } from 'primeng/chips';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeTableModule } from 'primeng/treetable';
import { CheckboxModule } from 'primeng/checkbox';
import { OverlaysDemoComponent } from './demo/components/uikit/overlays/overlaysdemo.component';
import { SplitButtonModule } from 'primeng/splitbutton';
import { FileUploadModule } from 'primeng/fileupload';
import { CustomGroupEntityComponent } from './demo/components/uikit/custom-group-entity/custom-group-entity.component';
import { CustomGroupListComponent } from './demo/components/uikit/custom-group-list/custom-group-list.component';
import { FileDemoComponent } from './demo/components/uikit/file/filedemo.component';

@NgModule({
  declarations: [
    AppMenuitemComponent,
    AppTopBarComponent,
    AppFooterComponent,
    AppMenuComponent,
    AppSidebarComponent,
    AppLayoutComponent,
    AppComponent,
    NotfoundComponent,
    LoadingComponent,
    ProgressBarComponent,
    SafeUrlPipe,
    AnnouncementDetailsComponent,
    SystemSettingsComponent,
    LoginComponent,
    DashboardComponent,
    DepartmentsComponent,
    DepartmentComponent,
    UserUploadValidatorComponent,
    EditDepartmentComponent,
    TimeAgoPipe,
    AddCompanyComponent,
    TableDemoComponent,
    UserCardComponent,
    MediaDemoComponent,
    CategoryComponent,
    AnnouncementreportComponent,
    CategoryComponent,
    EachAnnoNotedListComponent,
    OverlaysDemoComponent,
    CustomGroupEntityComponent,
    CustomGroupListComponent,
    FileDemoComponent
  ],
  imports: [
    BadgeModule,
    ChipModule,
    AppRoutingModule,
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
    AngularFireModule.initializeApp(environment.firebaseConfig), // Initialize Firebase
    AngularFirestoreModule, // Firestore module
    DialogModule,
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
    SliderModule,
    ToggleButtonModule,
    MultiSelectModule,
    DropdownModule,
    PdfViewerModule,
    HttpClientModule,
    RatingModule,
    SliderModule,
    InputTextModule,
    SkeletonModule,
    AutoCompleteModule,
    CalendarModule,
    ChipsModule,
    InputMaskModule,
    InputNumberModule,
    CascadeSelectModule,
    InputTextareaModule,
    ToolbarModule,
    TreeTableModule,
    CheckboxModule,
    SplitButtonModule,
    FileUploadModule
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
