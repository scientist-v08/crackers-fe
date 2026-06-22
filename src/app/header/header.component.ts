import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderRouterInterface } from '../interfaces/header-router.interface';
import { LoginService } from '../services/login.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    template: `
        <header class="app-header">
            <h1 class="app-brand">{{ title() }}</h1>
            <nav class="app-nav" aria-label="Main navigation">
                @for (route of allRoutes(); track route.id) {
                    @if (route.heading === 'Logout') {
                        <button class="app-nav-button" type="button" (click)="logout()">
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
    title = input<string>('');
    logoutClicked = output<void>();

    logout(): void {
        this.#loginService.logout();
    }
}