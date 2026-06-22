import { Component, computed, input, output } from '@angular/core';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [],
    template: `
        <button
            [class]="buttonClass()"
            [disabled]="isDisabled()"
            (mousedown)="buttonClicked.emit()"
            (keydown.enter)="buttonClicked.emit()"
        >
            <ng-content />
        </button>
    `,
})
export class ButtonComponent {
    isDisabled = input<boolean>(false);
    variant = input<'primary' | 'secondary' | 'accent'>('primary');
    width = input<string>('w-28');
    buttonClicked = output<void>();

    buttonClass = computed(() => {
        const variantClass =
            this.variant() === 'secondary'
                ? 'btn-secondary'
                : this.variant() === 'accent'
                  ? 'btn-accent'
                  : 'btn-primary';
        return `btn ${variantClass} ${this.width()}`;
    });
}