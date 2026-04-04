import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BillComparisonInterface } from '../interfaces/billComparison.interface';
import { ButtonComponent } from './button.component';

@Component({
    selector: 'app-bill-comparison',
    standalone: true,
    imports: [ButtonComponent, ReactiveFormsModule],
    template: `
        <div class="grid__container">
            <div class="one">
                <p>Discount: {{ allBillComparisons()[0].discount }}</p>
                <p>Grand Total: {{ allBillComparisons()[0].total }}</p>
            </div>
            <div class="two">
                <p>Discount: {{ allBillComparisons()[1].discount }}</p>
                <p>Grand Total: {{ allBillComparisons()[1].total }}</p>
                <app-button (buttonClicked)="finalize.emit(0.24)">Finalize this</app-button>
            </div>
            <div class="three">
                <p>Discount: {{ allBillComparisons()[2].discount }}</p>
                <p>Grand Total: {{ allBillComparisons()[2].total }}</p>
                <app-button (buttonClicked)="finalize.emit(0.23)">Finalize this</app-button>
            </div>
            <div class="four">
                <p>Discount: {{ allBillComparisons()[3].discount }}</p>
                <p>Grand Total: {{ allBillComparisons()[3].total }}</p>
                <app-button (buttonClicked)="finalize.emit(0.2)">Finalize this</app-button>
            </div>
        </div>
        <form
            class="flex items-center justify-center md:flex-row flex-col gap-4 mt-4"
            [formGroup]="form"
        >
            <label
                class="block font-medium text-gray-700 dark:text-gray-300 mb-2 text-2xl"
                for="quantity"
            >
                Finalize other amount
            </label>
            <input
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                id="otherAmt"
                min="0"
                step="1"
                onpaste="return false;"
                onkeydown="
                    return event.key !== '-' && event.key !== 'e' && event.key !== 'E';
                "
                formControlName="otherAmt"
                type="number"
                placeholder="Enter other amount"
            />
            <app-button (buttonClicked)="otherAmountFinalized()">Finalize this</app-button>
        </form>
    `,
    styles: [
        `
            .grid__container {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr 1fr;
                grid-template-areas: 'one two three four';
            }
            .one {
                grid-area: one;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }
            .two {
                grid-area: two;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }
            .three {
                grid-area: three;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }
            .four {
                grid-area: four;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }
            @media (max-width: 768px) {
                .grid__container {
                    grid-template-columns: 1fr;
                    grid-template-areas:
                        'one'
                        'two'
                        'three'
                        'four';
                }
            }
        `,
    ],
})
export class BillComparisonComponent {
    allBillComparisons = input.required<BillComparisonInterface[]>();
    finalize = output<number>();
    otherFinalize = output<number>();

    form = new FormGroup({
        otherAmt: new FormControl(0),
    });

    otherAmountFinalized(): void {
        this.otherFinalize.emit(this.form.controls.otherAmt.value ?? 0);
    }
}
