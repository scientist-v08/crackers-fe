import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BillComparisonInterface } from '../interfaces/billComparison.interface';
import { ButtonComponent } from './button.component';

@Component({
    selector: 'app-bill-comparison',
    standalone: true,
    imports: [ButtonComponent, ReactiveFormsModule],
    template: `
        <div class="section-header">
            <h2 class="section-title">Price Comparison</h2>
            <p class="section-description">Compare totals across discount tiers</p>
        </div>

        <div class="card-body">
            <div class="comparison-grid">
                @for (comparison of allBillComparisons(); track comparison.discount) {
                    <div class="comparison-card">
                        <p class="comparison-card-label">Discount</p>
                        <p class="comparison-card-value">{{ comparison.discount }}</p>
                        <p class="comparison-card-label mt-3">Grand Total</p>
                        <p class="comparison-card-value">₹{{ comparison.total }}</p>
                    </div>
                }
            </div>

            <form class="section-actions section-actions--end" [formGroup]="form">
                <div class="form-field flex-1 sm:max-w-xs">
                    <label class="form-label" for="otherAmt">Finalize Other Amount</label>
                    <input
                        class="form-control"
                        id="otherAmt"
                        min="0"
                        step="1"
                        onpaste="return false;"
                        onkeydown="return event.key !== '-' && event.key !== 'e' && event.key !== 'E';"
                        formControlName="otherAmt"
                        type="number"
                        placeholder="Enter custom amount"
                    />
                </div>
                <app-button variant="accent" (buttonClicked)="otherAmountFinalized()">
                    Finalize Amount
                </app-button>
            </form>
        </div>
    `,
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