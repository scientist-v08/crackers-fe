import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderRouterInterface } from '../interfaces/header-router.interface';
import { MenubarModule } from 'primeng/menubar';
import { LoginService } from '../services/login.service';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, MenubarModule],
    template: `
        <!-- Mobile navigation -->
        <p-menubar [model]="items()">
            <ng-template #end>
                <h1 class="app-brand">
                    {{ title() }}
                </h1>
            </ng-template>
        </p-menubar>
        <header class="app-header">
            <h1 class="app-brand">{{ title() }}</h1>
            <nav class="app-nav" aria-label="Main navigation">
                @for (route of allRoutes(); track route.id) {
                    @if (route.heading === 'Logout') {
                        <button class="app-nav-link" type="button" (click)="logout()">
                            {{ route.heading }}
                        </button>
                    } @else {
                        <a
                            class="app-nav-link"
                            [routerLink]="route.route"
                            routerLinkActive="app-nav-link--active"
                        >
                            {{ route.heading }}
                        </a>
                    }
                }
            </nav>
        </header>
    `,
})
export class HeaderComponent {
    #loginService = inject(LoginService);
    allRoutes = input.required<HeaderRouterInterface[]>();
    items = computed<MenuItem[]>(() => {
        const convertedRoutes = this.allRoutes().map((route) => {
            if (route.heading === 'Logout') {
                return { label: 'Logout', command: () => this.logout() };
            }
            return { label: route.heading, routerLink: route.route };
        });
        return convertedRoutes;
    });
    title = input<string>('');
    logoutClicked = output<void>();

    logout(): void {
        this.#loginService.logout();
    }
}
