import { Component, Input } from '@angular/core';
import { LayoutService } from '../service/app.layout.service';
import { MenuService } from '../app.menu.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageDemoService } from 'src/app/services/message/message.service';
import { SystemService } from 'src/app/services/system/system.service';

@Component({
    selector: 'app-config',
    templateUrl: './app.config.component.html',
})
export class AppConfigComponent {
    @Input() minimal: boolean = false;
    isDarkMode: boolean = false;

    scales: number[] = [12, 13, 14, 15, 16];
    showLogoutConfirmation: boolean = false;  // Add this property

    constructor(
        public layoutService: LayoutService,
        public menuService: MenuService,
        private http: HttpClient,
        private session: LocalStorageService,
        private router: Router,
        private messageService: MessageDemoService,
        private systemService: SystemService
    ) {}



    get visible(): boolean {
        return this.layoutService.state.configSidebarVisible;
    }
    set visible(_val: boolean) {
        this.layoutService.state.configSidebarVisible = _val;
    }

    logOut(): void {
        this.showLogoutConfirmation = true;  // Show the confirmation dialog
    }

    async confirmLogout(): Promise<void> {

            this.messageService.toast('info', 'Logged out.');
            this.router.navigate(['/auth/login']); // Navigate to login page
             this.showLogoutConfirmation = false; // Hide the confirmation dialog
    }

    cancelLogout(): void {
        this.showLogoutConfirmation = false;  // Hide the confirmation dialog
    }

    get scale(): number {
        return this.layoutService.config().scale;
    }
    set scale(_val: number) {
        if (this.scales.includes(_val)) {
            this.layoutService.config.update((config) => ({
                ...config,
                scale: _val,
            }));
        }
    }

    get menuMode(): string {
        return this.layoutService.config().menuMode;
    }
    set menuMode(_val: string) {
        this.layoutService.config.update((config) => ({
            ...config,
            menuMode: _val,
        }));
    }

    get inputStyle(): string {
        return this.layoutService.config().inputStyle;
    }
    set inputStyle(_val: string) {
        this.layoutService.config().inputStyle = _val;
    }

    get ripple(): boolean {
        return this.layoutService.config().ripple;
    }
    set ripple(_val: boolean) {
        this.layoutService.config.update((config) => ({
            ...config,
            ripple: _val,
        }));
    }

    get theme(): string {
        return this.layoutService.config().theme;
    }
    set theme(val: string) {
        this.layoutService.config.update((config) => ({
            ...config,
            theme: val,
        }));
    }

    get colorScheme(): string {
        return this.layoutService.config().colorScheme;
    }
    set colorScheme(val: string) {
        this.layoutService.config.update((config) => ({
            ...config,
            colorScheme: val,
        }));
    }

    onConfigButtonClick() {
        this.layoutService.showConfigSidebar();
    }
    changeTheme(theme: string, mode: string) {
        const themePath = `assets/layout/styles/theme/${theme}/theme.css`;
        document.getElementById('theme-css').setAttribute('href', themePath);
    }

    decrementScale() {
        this.scale--;
    }

    incrementScale() {
        this.scale++;
    }
}
