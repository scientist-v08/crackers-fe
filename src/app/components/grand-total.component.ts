import { Component, input, output } from '@angular/core';
import { ButtonComponent } from './button.component';

@Component({
    selector: 'app-grand-total',
    standalone: true,
    imports: [ButtonComponent],
    template: `
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div class="text-center lg:text-left">
                <p class="total-label">
                    {{ finalizedAmt() > 0 ? 'Finalized Amount' : 'Grand Total' }}
                </p>
                <p class="total-amount mt-2">
                    ₹{{ finalizedAmt() > 0 ? finalizedAmt() : grandTotal() }}
                </p>
            </div>
            <div class="section-actions section-actions--center lg:border-0 lg:pt-0">
                <app-button variant="accent" (buttonClicked)="generateBill.emit()">
                    Generate Bill
                </app-button>
                <app-button (buttonClicked)="previewBill.emit()">Preview Bill</app-button>
                <app-button variant="secondary" (buttonClicked)="comparePrices.emit()">
                    Compare Prices
                </app-button>
                <app-button variant="secondary" (buttonClicked)="newBill.emit()">New Bill</app-button>
            </div>
        </div>
    `,
})
export class GrandTotalComponent {
    grandTotal = input.required<number>();
    finalizedAmt = input.required<number>();
    generateBill = output<void>();
    previewBill = output<void>();
    comparePrices = output<void>();
    newBill = output<void>();
}