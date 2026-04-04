import {
    Directive,
    ElementRef,
    HostListener,
    OnChanges,
    Renderer2,
    SimpleChanges,
    inject,
    input,
    output,
    signal,
} from '@angular/core';

@Directive({
    selector: 'button[appOnClicked]',
    standalone: true,
})
export class OnClickedDirective implements OnChanges {
    private el = inject(ElementRef);
    private renderer = inject(Renderer2);
    appOnClicked = output<boolean>();
    status = input<boolean>();
    mouseClicked = signal<boolean>(false);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['status']) {
            if (changes['status'].previousValue === true) {
                if (this.mouseClicked() !== true) {
                    this.toggler();
                } else {
                    this.mouseClicked.set(false);
                    const closeTargetElement =
                        this.el.nativeElement.querySelector('.section__icon-close');
                    if (closeTargetElement) {
                        this.appOnClicked.emit(false);
                        this.renderer.removeClass(closeTargetElement, 'section__icon-close');
                        this.renderer.addClass(closeTargetElement, 'section__icon');
                    }
                }
            }
        }
    }

    @HostListener('mousedown')
    onClick(): void {
        this.mouseClicked.set(true);
        this.toggler();
    }

    private toggler(): void {
        const targetElement = this.el.nativeElement.querySelector('.section__icon');
        if (targetElement) {
            this.appOnClicked.emit(true);
            this.renderer.removeClass(targetElement, 'section__icon');
            this.renderer.addClass(targetElement, 'section__icon-close');
        } else {
            const closeTargetElement = this.el.nativeElement.querySelector('.section__icon-close');
            this.appOnClicked.emit(false);
            this.renderer.removeClass(closeTargetElement, 'section__icon-close');
            this.renderer.addClass(closeTargetElement, 'section__icon');
        }
    }
}
