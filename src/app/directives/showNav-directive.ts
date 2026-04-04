import {
    Directive,
    ElementRef,
    OnChanges,
    Renderer2,
    SimpleChanges,
    inject,
    input,
    output,
} from '@angular/core';

@Directive({
    selector: 'nav[appShowNav]',
    standalone: true,
})
export class ShowNavDirective implements OnChanges {
    appShowNav = input.required<boolean>();
    appNoShow = output<boolean>();
    private el = inject(ElementRef);
    private renderer = inject(Renderer2);

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['appShowNav']) {
            if (this.appShowNav()) {
                this.renderer.setStyle(this.el.nativeElement, 'display', 'block');
            } else {
                this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
            }
        }
    }
}
