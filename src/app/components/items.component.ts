import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ItemsInterface } from '../interfaces/items.interface';
import { ButtonComponent } from './button.component';

@Component({
    selector: 'app-items',
    standalone: true,
    imports: [ButtonComponent, ReactiveFormsModule],
    template: `
        <div class="data-card-header">Item #{{ item().slNo }}</div>

        <div class="data-row">
            <span class="data-row-label">Item</span>
            <span class="data-row-value">{{ item().item }}</span>
        </div>

        <div class="data-row">
            <span class="data-row-label">MRP / Net</span>
            <span class="data-row-value">
                @if (editMode()) {
                    <input
                        class="form-control w-28"
                        id="mrpInputBox"
                        [formControl]="itemForm.controls.mrpOrNet"
                        type="number"
                    />
                } @else {
                    {{ item().mrpOrNet }}
                }
            </span>
        </div>

        <div class="data-row">
            <span class="data-row-label">Discount</span>
            <span class="data-row-value">{{ item().discount }}</span>
        </div>

        <div class="data-row">
            <span class="data-row-label">Quantity</span>
            <span class="data-row-value">
                @if (editMode()) {
                    <input
                        class="form-control w-28"
                        id="quantityInputBox"
                        [formControl]="itemForm.controls.quantity"
                        type="number"
                    />
                } @else {
                    {{ item().quantity }}
                }
            </span>
        </div>

        <div class="data-row">
            <span class="data-row-label">Sub-total</span>
            <span class="data-row-value">₹{{ item().subTotal }}</span>
        </div>

        <div class="section-actions section-actions--center">
            <app-button
                [variant]="editMode() ? 'accent' : 'secondary'"
                (buttonClicked)="editClicked()"
            >
                {{ editMode() ? 'Done Editing' : 'Edit' }}
            </app-button>
            <app-button variant="secondary" (buttonClicked)="deleteClicked(item().slNo)">
                Delete
            </app-button>
        </div>
    `,
})
export class ItemsClass {
    #fb = inject(FormBuilder);
    itemForm = this.#fb.group({
        quantity: this.#fb.control(0),
        mrpOrNet: this.#fb.control(0),
    });
    item = input.required<ItemsInterface>();
    toEdit = output<ItemsInterface>();
    editMode = signal<boolean>(false);
    toDelete = output<number>();

    editClicked(): void {
        if (!this.editMode()) {
            this.editMode.set(true);
            this.itemForm.setValue({
                quantity: this.item().quantity,
                mrpOrNet: this.item().mrpOrNet,
            });
        } else {
            this.editMode.set(false);
            this.toEdit.emit({
                slNo: this.item().slNo,
                item: this.item().item,
                mrpOrNet: this.itemForm.controls.mrpOrNet.getRawValue() ?? 0,
                quantity: this.itemForm.controls.quantity.getRawValue() ?? 0,
                discount: this.item().discount,
                subTotal: this.item().subTotal,
            });
        }
    }

    deleteClicked(slNo: number): void {
        this.toDelete.emit(slNo);
    }
}