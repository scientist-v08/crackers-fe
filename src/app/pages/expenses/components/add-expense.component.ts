import { Component, inject, OnDestroy, output, signal } from '@angular/core';
import { ButtonComponent } from '../../../components/button.component';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import {
  AddExpenseInterface,
  AddExpenseSuccess,
} from '../../../interfaces/expenses.interface';
import { ExpensesService } from '../../../services/expenses.service';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [
    ButtonComponent,
    Dialog,
    InputTextModule,
    ReactiveFormsModule,
    InputNumberModule,
  ],
  selector: 'app-add-expense',
  template: `
    <app-button (buttonClicked)="visible = true">Add New +</app-button>
    <p-dialog
      [formGroup]="addExpense"
      header="Add New Item"
      [modal]="true"
      [(visible)]="visible"
      [style]="{ width: '25rem' }"
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
      </div>
      <div class="flex flex-col mb-4">
        <label for="amount" class="font-semibold w-full">Amount</label>
        <p-inputnumber
          id="amount"
          locale="en-IN"
          inputId="locale-indian"
          formControlName="amount"
        />
      </div>
      <div class="flex justify-end gap-2">
        <app-button (buttonClicked)="visible = false">Cancel</app-button>
        <div>
          <app-button (buttonClicked)="submitForm()">Save</app-button>
          @if (validForm()) {
          <small class="text-red"
            >Invalid entries. All fields are required.</small
          >
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
    reasonForExpense: this.#fb.control('', [Validators.required]),
    amount: this.#fb.control(0, [Validators.min(1)]),
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
        reasonForExpense:
          this.addExpense.controls.reasonForExpense.getRawValue() ?? '',
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
