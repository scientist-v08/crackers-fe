import { Component, input, output } from '@angular/core';
import { ButtonComponent } from './button.component';

@Component({
    selector: 'app-grand-total',
    standalone: true,
    imports: [ButtonComponent],
    template: `
        <div class="grid__container">
            <div class="one">
                <h1>{{ finalizedAmt() > 0 ? 'Finalized Amount:' : 'Grand Total:' }}</h1>
            </div>
            <div class="two">{{ finalizedAmt() > 0 ? finalizedAmt() : grandTotal() }}</div>
            <div class="three">
                <app-button (buttonClicked)="generateBill.emit()">Generate Bill</app-button>
                <app-button (buttonClicked)="previewBill.emit()">Preview Bill</app-button>
                <app-button (buttonClicked)="comparePrices.emit()">Compare prices</app-button>
                <app-button (buttonClicked)="newBill.emit()">New Bill</app-button>
            </div>
        </div>
    `,
    styles: [
        `
            .grid__container {
                display: grid;
                grid-template-columns: 1fr 1fr 3fr;
                grid-template-areas: 'one two three';
            }
            .one {
                grid-area: one;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .two {
                grid-area: two;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .three {
                grid-area: three;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
            }
            @media (max-width: 768px) {
                .grid__container {
                    grid-template-columns: 1fr;
                    grid-template-areas:
                        'one'
                        'two'
                        'three';
                }
                .one {
                    flex-direction: column;
                }
                .two {
                    flex-direction: column;
                }
                .three {
                    flex-direction: column;
                }
            }
        `,
    ],
})
export class GrandTotalComponent {
    grandTotal = input.required<number>();
    finalizedAmt = input.required<number>();
    generateBill = output<void>();
    previewBill = output<void>();
    comparePrices = output<void>();
    newBill = output<void>();
}
