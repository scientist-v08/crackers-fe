import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [],
    template: `
        <button
            class="w-48 font-inter text-black bg-amber-300 dark:text-white dark:bg-pink-600 hover:bg-amber-400 dark:hover:bg-pink-700 
      focus:ring-2 focus:ring-amber-300 dark:focus:ring-pink-400 font-medium px-4 py-2 rounded-md transition-colors 
      disabled:opacity-50 disabled:saturate-50"
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
    buttonClicked = output<void>();
}
