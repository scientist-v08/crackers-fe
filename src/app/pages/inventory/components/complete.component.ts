import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { InventoryService } from '../../../services/inventory.service';
import { ButtonComponent } from './button.component';
import {
    InventoryStateOrdered,
    InventoryStateReceived,
    InventoryStateUnpacked,
} from '../../../constants/inventory.constants';
import { InventoryItem } from '../../../interfaces/inventory.interface';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Dialog } from 'primeng/dialog';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    standalone: true,
    imports: [ButtonComponent, Dialog, ReactiveFormsModule, InputNumberModule],
    selector: 'app-complete',
    template: `
        <div class="btn-group">
            <app-button [width]="'w-auto'" (buttonClicked)="complete()">Mark {{ goToState() }}</app-button>
            <app-button
                variant="secondary"
                [width]="'w-auto'"
                (buttonClicked)="partialCompleteDialogOpen()"
            >
                Partially {{ goToState() }}
            </app-button>
        </div>
        <p-dialog
            [formGroup]="partialNumberForm"
            header="Partial Receipt"
            [modal]="true"
            [(visible)]="visible"
            [style]="{ width: '25rem' }"
        >
            <div class="form-field">
                <label for="numberOfCartons" class="form-label form-label-required"
                    >Number of Cartons Actually Received</label
                >
                <p-inputnumber
                    class="w-full"
                    id="numberOfCartons"
                    locale="en-IN"
                    inputId="locale-indian"
                    formControlName="number"
                />
                <div class="form-message">
                    @if (validForm()) {
                        <small class="form-error">Invalid entry</small>
                    }
                </div>
            </div>
            <div class="dialog-actions section-actions--end">
                <app-button variant="secondary" (buttonClicked)="visible = false">Cancel</app-button>
                <app-button variant="accent" (buttonClicked)="submitForm()">Save</app-button>
            </div>
        </p-dialog>
    `,
})
export class CompleteComponent implements OnInit {
    #inventoryService = inject(InventoryService);
    itemToBeCompleted = input.required<InventoryItem>();
    state = this.#inventoryService.state;
    goToState = computed(() => {
        switch (this.state()) {
            case InventoryStateOrdered:
                return InventoryStateReceived;
            case InventoryStateReceived:
                return InventoryStateUnpacked;
            default:
                return InventoryStateReceived;
        }
    });
    unsubscribe$ = new Subject<void>();
    toaster = output<{ type: string; message: string }>();
    toasterForPartial = output<{
        type: string;
        message: string;
        id: number;
        numOfCartons: number;
    }>();
    validForm = signal<boolean>(false);
    visible = false;
    #fb = inject(FormBuilder);
    partialNumberForm = this.#fb.group({
        number: this.#fb.control(0),
    });

    public ngOnInit(): void {
        this.dynamicValidatorForForm();
    }

    private dynamicValidatorForForm(): void {
        this.partialNumberForm.controls.number.addValidators([
            Validators.max(this.itemToBeCompleted().NumOfCartons),
        ]);
    }

    complete(): void {
        this.#inventoryService
            .updateInventoryItem(this.itemToBeCompleted())
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
                next: (val) => {
                    this.toaster.emit({ type: 'success', message: val.message });
                },
                error: (err: HttpErrorResponse) => {
                    let errorMsg = 'An unexpected error occurred';

                    if (err.error && typeof err.error === 'object') {
                        if (err.error.error) {
                            errorMsg = err.error.error;
                        } else if (err.error.message) {
                            errorMsg = err.error.message;
                        }
                    } else if (typeof err.error === 'string') {
                        errorMsg = err.error;
                    } else if (err.message) {
                        errorMsg = err.message;
                    }
                    this.toaster.emit({ type: 'error', message: errorMsg });
                },
            });
    }

    partialCompleteDialogOpen(): void {
        this.visible = true;
    }

    submitForm(): void {
        if (this.partialNumberForm.valid) {
            this.visible = false;
            const partialItem: InventoryItem = {
                ...this.itemToBeCompleted(),
                NumOfCartons: this.partialNumberForm.controls.number.getRawValue() ?? 0,
            };
            this.#inventoryService
                .updateInventoryItem(partialItem)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe({
                    next: (val) => {
                        this.toasterForPartial.emit({
                            type: 'success',
                            message: val.message,
                            id: partialItem.ID,
                            numOfCartons: partialItem.NumOfCartons,
                        });
                    },
                    error: (err: HttpErrorResponse) => {
                        let errorMsg = 'An unexpected error occurred';

                        if (err.error && typeof err.error === 'object') {
                            if (err.error.error) {
                                errorMsg = err.error.error;
                            } else if (err.error.message) {
                                errorMsg = err.error.message;
                            }
                        } else if (typeof err.error === 'string') {
                            errorMsg = err.error;
                        } else if (err.message) {
                            errorMsg = err.message;
                        }
                        this.toaster.emit({ type: 'error', message: errorMsg });
                    },
                });
        } else {
            this.validForm.set(true);
        }
    }
}
