import { Component, computed, inject, input, output, signal } from '@angular/core';
import { HeaderRouterInterface } from '../interfaces/header-router.interface';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { LoginService } from '../services/login.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [MenubarModule],
    template: `
        <p-menubar [model]="items()">
            <ng-template #start>
                <h1
                    class="flex align-center items-center justify-center text-2xl font-semibold hidden md:block"
                >
                    {{ title() }}
                </h1>
            </ng-template>
            <ng-template #end>
                <h1
                    class="flex align-center items-center justify-center text-2xl font-semibold md:hidden block"
                >
                    {{ title() }}
                </h1>
            </ng-template>
        </p-menubar>
    `,
})
export class HeaderComponent {
    #loginService = inject(LoginService);
    navBarStatus = signal<boolean>(false);
    allRoutes = input.required<HeaderRouterInterface[]>();
    title = input<string>('');
    logoutClicked = output<void>();
    baseClass = 'sticky top-0 z-10 p-3';
    inputBgColorTxColor = input<string>('');
    finalClass = computed(() => this.baseClass + this.inputBgColorTxColor());
    items = computed(() => {
        const routes = this.allRoutes();
        const mappedRoutes = routes.map((val: HeaderRouterInterface) => {
            let menuItem: MenuItem;
            if (val.heading === 'Logout') {
                menuItem = {
                    label: val.heading,
                    command: () => this.logout(),
                };
            } else {
                menuItem = {
                    label: val.heading,
                    routerLink: val.route,
                };
            }
            return menuItem;
        });
        return mappedRoutes;
    });

    logout(): void {
        this.#loginService.logout();
    }
}
