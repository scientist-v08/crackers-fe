import { Component, inject, OnDestroy, output, signal } from '@angular/core';
import { ButtonComponent } from '../../inventory/components/button.component';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { AddExpenseInterface, AddExpenseSuccess } from '../../../interfaces/expenses.interface';
import { ExpensesService } from '../../../services/expenses.service';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

const minLengthAfterTrim = (minLength: number) => {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) return null;

        const trimmed = control.value.toString().trim();

        return trimmed.length < minLength
            ? { minlength: { requiredLength: minLength, actualLength: trimmed.length } }
            : null;
    };
};

@Component({
    standalone: true,
    imports: [ButtonComponent, Dialog, InputTextModule, ReactiveFormsModule, InputNumberModule],
    selector: 'app-add-expense',
    template: `
        <app-button [width]="'w-3xs md:w-28'" (buttonClicked)="visible = true">Add New</app-button>
        <p-dialog
            [formGroup]="addExpense"
            header="Add New Item"
            [modal]="true"
            [(visible)]="visible"
            [style]="{ width: '28rem' }"
        >
            <div class="flex flex-col mb-4">
                <label for="reasonForExpense" class="font-semibold w-full"
                    >Reason for expense</label
                >
                <input
                    formControlName="reasonForExpense"
                    pInputText
                    id="reasonForExpense"
                    class="flex-auto"
                    autocomplete="off"
                />
                <div class="text-red-600 text-sm mt-1 min-h-[20px]">
                    @if (
                        addExpense.get('reasonForExpense')?.hasError('required') &&
                        addExpense.get('reasonForExpense')?.touched
                    ) {
                        <span>Reason for expense is required</span>
                    }
                    @if (
                        addExpense.get('reasonForExpense')?.hasError('minlength') &&
                        addExpense.get('reasonForExpense')?.touched
                    ) {
                        <span
                            >Reason must be at least 5 characters long without counting the
                            spaces</span
                        >
                    }
                </div>
            </div>
            <div class="flex flex-col mb-4">
                <label for="amount" class="font-semibold w-full">Amount</label>
                <p-inputnumber
                    id="amount"
                    locale="en-IN"
                    inputId="locale-indian"
                    formControlName="amount"
                />
                <div class="text-red-600 text-sm mt-1 min-h-[20px]">
                    @if (
                        addExpense.get('amount')?.hasError('min') &&
                        addExpense.get('amount')?.touched
                    ) {
                        Amount must be at least 10
                    }
                </div>
            </div>
            <div class="flex justify-center items-center gap-2 mx-auto">
                <app-button (buttonClicked)="visible = false">Cancel</app-button>
                <div>
                    <app-button (buttonClicked)="submitForm()">Save</app-button>
                    @if (validForm()) {
                        <small class="text-red">Invalid entries. All fields are required.</small>
                    }
                </div>
            </div>
        </p-dialog>
    `,
})
export class AddExpenseComponent implements OnDestroy {
    #fb = inject(FormBuilder);
    #expensesService = inject(ExpensesService);
    addExpense = this.#fb.group({
        reasonForExpense: this.#fb.control('', [Validators.required, minLengthAfterTrim(5)]),
        amount: this.#fb.control(0, [Validators.min(10)]),
    });
    visible = false;
    validForm = signal<boolean>(false);
    unsubscribe$ = new Subject<void>();
    successToast = output<void>();
    errToast = output<HttpErrorResponse>();

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public submitForm(): void {
        if (this.addExpense.valid) {
            this.validForm.set(false);
            const reqbody: AddExpenseInterface = {
                reasonForExpense: this.addExpense.controls.reasonForExpense.getRawValue() ?? '',
                amount: this.addExpense.controls.amount.getRawValue() ?? 1,
            };
            this.#expensesService
                .addExpense(reqbody)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe({
                    next: () => {
                        this.successToast.emit();
                    },
                    error: (err: HttpErrorResponse) => {
                        this.errToast.emit(err);
                    },
                    complete: () => {
                        this.visible = false;
                    },
                });
        } else {
            this.validForm.set(true);
        }
    }
}
