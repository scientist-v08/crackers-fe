import { Component, computed, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-bill-items-action-button',
    imports: [],
    changeDetection: ChangeDetectionStrategy.Eager,
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
export class BillItemsActionButton {
    isDisabled = input<boolean>(false);
    variant = input<'primary' | 'secondary' | 'accent'>('primary');
    width = input<string>('w-33');
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
