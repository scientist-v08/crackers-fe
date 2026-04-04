import { Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HideNavDirective } from '../directives/hideNav-directive';
import { OnClickedDirective } from '../directives/onClicked-directive';
import { ShowNavDirective } from '../directives/showNav-directive';
import { HeaderRouterInterface } from '../interfaces/header-router.interface';

@Component({
    selector: 'lib-shared-ui-header',
    standalone: true,
    imports: [HideNavDirective, OnClickedDirective, ShowNavDirective, RouterLink],
    template: `
        <header [class]="finalClass()">
            <section class="py-1 px-2 flex flex-row flex-nowrap justify-between w-full">
                <h1 class="flex align-center items-center justify-center text-2xl font-semibold">
                    {{ title() }}
                </h1>
                <button
                    class="section__button"
                    [status]="navBarStatus()"
                    (appOnClicked)="navBarStatus.set($event)"
                >
                    <div class="section__icon"></div>
                </button>
                <div class="section__items">
                    @for (route of allRoutes(); track route.id) {
                        <h2 class="p-2 flex items-center justify-center text-xl">
                            @if (route.heading === 'Logout') {
                                <p (mousedown)="logoutClicked.emit()" style="cursor: pointer;">
                                    {{ route.heading }}
                                </p>
                            } @else {
                                <a [routerLink]="route.route">{{ route.heading }}</a>
                            }
                        </h2>
                    }
                </div>
            </section>

            <nav class="font-bold origin-top" [appShowNav]="navBarStatus()">
                <ul class="p-[0.25em] px-[2.5%] list-none flex flex-col flex-nowrap">
                    @for (route of allRoutes(); track route.id) {
                        <li
                            class="p-2 flex items-center justify-center"
                            (appHideNav)="navBarStatus.set(false)"
                        >
                            <a [routerLink]="route.route">{{ route.heading }}</a>
                        </li>
                    }
                </ul>
            </nav>
        </header>
    `,
    styleUrls: ['./ui-header.component.scss'],
})
export class SharedUiComponent {
    navBarStatus = signal<boolean>(false);
    allRoutes = input<HeaderRouterInterface[]>();
    title = input<string>('');
    logoutClicked = output<void>();
    baseClass = 'sticky top-0 z-10 p-3';
    inputBgColorTxColor = input<string>('');
    finalClass = computed(() => this.baseClass + this.inputBgColorTxColor());
}
