import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ButtonComponent } from '../../../components/button.component';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { combineLatest, map, startWith, Subject, takeUntil } from 'rxjs';
import { NewInventoryItem } from '../../../interfaces/inventory.interface';
import { InventoryStateOrdered } from '../../../constants/inventory.constants';
import { InventoryService } from '../../../services/inventory.service';
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
  selector: 'app-add-item',
  template: `
    <app-button (buttonClicked)="visible = true">Add New +</app-button>
    <p-dialog
      [formGroup]="addNewForm"
      header="Add New Item"
      [modal]="true"
      [(visible)]="visible"
      [style]="{ width: '25rem' }"
    >
      <div class="flex flex-col mb-4">
        <label for="brandOrCompany" class="font-semibold w-24"
          >Brand/Company</label
        >
        <input
          formControlName="brandOrCompany"
          pInputText
          id="brandOrCompany"
          class="flex-auto"
          autocomplete="off"
        />
      </div>
      <div class="flex flex-col mb-4">
        <label for="item" class="font-semibold w-24">Item</label>
        <input
          formControlName="item"
          pInputText
          id="item"
          class="flex-auto"
          autocomplete="off"
        />
      </div>
      <div class="flex flex-col mb-4">
        <label for="numberOfBoxes" class="font-semibold w-full"
          >Number of Boxes Per Carton</label
        >
        <p-inputnumber
          id="numberOfBoxes"
          locale="en-IN"
          inputId="locale-indian"
          formControlName="numberOfBoxes"
        />
      </div>
      <div class="flex flex-col mb-4">
        <label for="numberOfCartons" class="font-semibold w-full"
          >Number of Cartons</label
        >
        <p-inputnumber
          id="numberOfCartons"
          locale="en-IN"
          inputId="locale-indian"
          formControlName="numberOfCartons"
        />
      </div>
      <div class="flex flex-col mb-4">
        <label for="pricePerCarton" class="font-semibold w-full"
          >Price Per Carton</label
        >
        <p-inputnumber
          id="pricePerCarton"
          locale="en-IN"
          inputId="locale-indian"
          formControlName="pricePerCarton"
        />
      </div>
      <div class="flex flex-col mb-4">
        <label for="subTotal" class="font-semibold w-24">Sub-total</label>
        <p-inputnumber
          id="subTotal"
          formControlName="subTotal"
          mode="currency"
          inputId="currency-india"
          currency="INR"
          locale="en-IN"
        />
      </div>
      <div class="flex justify-end gap-2">
        <app-button (buttonClicked)="visible = false">Cancel</app-button>
        <div>
          <app-button (buttonClicked)="submitForm()">Save</app-button>
          @if (validForm()) {
          <small class="text-red-500"
            >Invalid entries. All fields are required.</small
          >
          }
        </div>
      </div>
    </p-dialog>
  `,
})
export class AddItemComponent implements OnInit, OnDestroy {
  #fb = inject(FormBuilder);
  #inventoryService = inject(InventoryService);
  toaster = output<{ type: string; message: string }>();
  addNewForm = this.#fb.group({
    brandOrCompany: this.#fb.control('', [Validators.required]),
    item: this.#fb.control('', [Validators.required]),
    numberOfBoxes: this.#fb.control(0, [Validators.min(1)]),
    numberOfCartons: this.#fb.control(0, [Validators.min(1)]),
    pricePerCarton: this.#fb.control(0, [Validators.min(1)]),
    subTotal: this.#fb.control({ value: 0, disabled: true }, [
      Validators.min(1),
    ]),
  });
  price$ = this.addNewForm
    .get('pricePerCarton')!
    .valueChanges.pipe(
      startWith(this.addNewForm.get('pricePerCarton')?.getRawValue())
    );
  cartons$ = this.addNewForm
    .get('numberOfCartons')!
    .valueChanges.pipe(
      startWith(this.addNewForm.get('numberOfCartons')?.getRawValue())
    );
  subTotalCalc$ = combineLatest([this.price$, this.cartons$]).pipe(
    map(([price, cartons]) => {
      const p = Number(price) || 0;
      const q = Number(cartons) || 0;
      return p * q;
    })
  );
  unsubscribe$ = new Subject<void>();
  visible = false;
  validForm = signal<boolean>(false);

  public ngOnInit(): void {
    this.setSubTotal();
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private setSubTotal(): void {
    this.subTotalCalc$.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (val) => {
        this.addNewForm.controls.subTotal.setValue(val, { emitEvent: false });
      },
    });
  }

  public submitForm(): void {
    if (this.addNewForm.valid) {
      this.validForm.set(false);
      const newItem: NewInventoryItem = {
        brandOrCompany:
          this.addNewForm.controls.brandOrCompany.getRawValue() ?? '',
        state: InventoryStateOrdered,
        item: this.addNewForm.controls.item.getRawValue() ?? '',
        numberOfBoxes:
          this.addNewForm.controls.numberOfBoxes.getRawValue() ?? 0,
        numberOfCartons:
          this.addNewForm.controls.numberOfCartons.getRawValue() ?? 0,
        pricePerCarton:
          this.addNewForm.controls.pricePerCarton.getRawValue() ?? 0,
        subtotal: this.addNewForm.controls.subTotal.getRawValue() ?? 0,
      };
      this.#inventoryService
        .addNewItemToInventory(newItem)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (val) => {
            this.toaster.emit({ type: 'success', message: val.Success });
            this.visible = false;
          },
          error: (err: HttpErrorResponse) => {
            let errorMsg = 'An unexpected error occurred';

            if (err.error && typeof err.error === 'object') {
              // Case 1: Backend sends { error: "Some message" }
              if (err.error.error) {
                errorMsg = err.error.error;
              }
              // Case 2: Backend sends { message: "..." }
              else if (err.error.message) {
                errorMsg = err.error.message;
              }
            } else if (typeof err.error === 'string') {
              // Case 3: Backend sends plain string
              errorMsg = err.error;
            } else if (err.message) {
              // Fallback to Angular's default message
              errorMsg = err.message;
            }
            this.toaster.emit({ type: 'error', message: errorMsg });
            this.visible = false;
          },
        });
    } else {
      this.validForm.set(true);
    }
  }
}
