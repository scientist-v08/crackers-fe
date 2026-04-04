import { Directive, HostListener, output } from '@angular/core';

@Directive({
    selector: 'li[appHideNav]',
    standalone: true,
})
export class HideNavDirective {
    appHideNav = output<boolean>();

    @HostListener('click')
    onClick() {
        this.appHideNav.emit(false);
    }
}
