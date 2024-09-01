import { HttpClient } from '@angular/common/http';
import { Injectable, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { LocalStorageService } from 'src/app/services/local-storage/local-storage.service';
import { MessageDemoService } from 'src/app/services/message/message.service';
import { SystemService } from 'src/app/services/system/system.service';

export interface AppConfig {
    inputStyle: string;
    colorScheme: string;
    theme: string;
    ripple: boolean;
    menuMode: string;
    scale: number;
}

interface LayoutState {
    staticMenuDesktopInactive: boolean;
    overlayMenuActive: boolean;
    profileSidebarVisible: boolean;
    configSidebarVisible: boolean;
    staticMenuMobileActive: boolean;
    menuHoverActive: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class LayoutService {
    // Initial configuration setup
    private _config: AppConfig = {
        ripple: false,
        inputStyle: 'outlined',
        menuMode: 'static',
        colorScheme: 'light',
        theme: 'lara-light-indigo',
        scale: 14,
    };

    // Using Angular's signal to manage reactive state
    config = signal<AppConfig>(this._config);

    // Initial layout state setup
    state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false,
    };

    // Subjects to notify about updates
    private configUpdate = new Subject<AppConfig>();
    private overlayOpen = new Subject<any>();

    // Observable streams
    configUpdate$ = this.configUpdate.asObservable();
    overlayOpen$ = this.overlayOpen.asObservable();

    constructor(

        private session: LocalStorageService,
        private router: Router,
        private messageService: MessageDemoService,

    ) {

        this.resetLayoutState();

        // Using effect to reactively update on config changes
        effect(() => {
            const config = this.config();
            if (this.updateStyle(config)) {
            }
            this.changeScale(config.scale);
            this.onConfigUpdate();
        });
    }

    // Checks if the style needs updating
    updateStyle(config: AppConfig): boolean {
        return (
            config.theme !== this._config.theme ||
            config.colorScheme !== this._config.colorScheme
        );
    }

    // Toggles menu state based on device type
    onMenuToggle() {
        if (this.isOverlay()) {
            this.state.overlayMenuActive = !this.state.overlayMenuActive;
            if (this.state.overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }

        if (this.isDesktop()) {
            this.state.staticMenuDesktopInactive =
                !this.state.staticMenuDesktopInactive;
        } else {
            this.state.staticMenuMobileActive =
                !this.state.staticMenuMobileActive;

            if (this.state.staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }

    async logOut1(): Promise<void> {
        if (await this.messageService.confirmed('Logout Confirmation', 'Are you sure to log out?', 'Yes', 'No', 'WHITE', 'BLACK')) {
            // Reset the layout state
            this.resetLayoutState();

            this.messageService.toast('info', 'Logged out.');
            this.session.clear();
            this.router.navigate(['/auth/login']);
        }
    }
    private resetLayoutState() {
        this.state = {
            staticMenuDesktopInactive: false,
            overlayMenuActive: false,
            profileSidebarVisible: false,
            configSidebarVisible: false,  // Ensure the config sidebar is not visible
            staticMenuMobileActive: false,
            menuHoverActive: false,
        };
    }

    // Toggles profile sidebar visibility
    showProfileSidebar() {
        this.state.profileSidebarVisible = !this.state.profileSidebarVisible;
        if (this.state.profileSidebarVisible) {
            this.overlayOpen.next(null);
        }
    }

    // Shows the configuration sidebar
    showConfigSidebar() {
        this.state.configSidebarVisible = true;
    }

    // Checks if the current menu mode is overlay
    isOverlay(): boolean {
        return this.config().menuMode === 'overlay';
    }

    // Checks if the current view is desktop
    isDesktop(): boolean {
        return window.innerWidth > 991;
    }

    // Checks if the current view is mobile
    isMobile(): boolean {
        return !this.isDesktop();
    }

    // Updates the configuration and notifies listeners
    onConfigUpdate() {
        this._config = { ...this.config() };
        this.configUpdate.next(this.config());
    }
    changeScale(value: number) {
        document.documentElement.style.fontSize = `${value}px`;
    }

}
