import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ItemsInterface } from '../interfaces/items.interface';
import { ButtonComponent } from './button.component';

@Component({
    selector: 'app-items',
    standalone: true,
    imports: [ButtonComponent, ReactiveFormsModule],
    template: `
        <div class="grid__container">
            <div class="one">{{ item().slNo }}</div>
            <div class="two">{{ item().item }}</div>
            <div class="three">
                @if (editMode()) {
                    <input
                        class="w-full dark:bg-transparent dark:text-amber-300 mb-4 p-2 border border-indigo-200 dark:border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-amber-400"
                        id="mrpInputBox"
                        [formControl]="itemForm.controls.mrpOrNet"
                        type="number"
                    />
                } @else {
                    {{ item().mrpOrNet }}
                }
            </div>
            <div class="four">{{ item().discount }}</div>
            <div class="five">
                @if (editMode()) {
                    <input
                        class="w-full dark:bg-transparent dark:text-amber-300 mb-4 p-2 border border-indigo-200 dark:border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-amber-400"
                        id="quantityInputBox"
                        [formControl]="itemForm.controls.quantity"
                        type="number"
                    />
                } @else {
                    {{ item().quantity }}
                }
            </div>
            <div class="six">{{ item().subTotal }}</div>
            <div class="seven">
                <app-button (buttonClicked)="editClicked()">
                    @if (editMode()) {
                        Done Editing
                    } @else {
                        Edit
                    }
                </app-button>
                <app-button (buttonClicked)="deleteClicked(item().slNo)">Delete</app-button>
            </div>
        </div>
    `,
    styles: [
        `
            .grid__container {
                display: grid;
                grid-template-columns: 0.1fr 2fr 1fr 1fr 1fr 1fr 2fr;
                grid-template-areas: 'one two three four five six seven';
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
            }
            .four {
                grid-area: four;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .five {
                grid-area: five;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .six {
                grid-area: six;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .seven {
                grid-area: seven;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                gap: 0.25rem;
            }
            @media (max-width: 768px) {
                .grid__container {
                    grid-template-columns: 1fr;
                    grid-template-areas:
                        'one'
                        'two'
                        'three'
                        'four'
                        'five'
                        'six'
                        'seven';
                }
                .seven {
                    flex-direction: column;
                }
            }
        `,
    ],
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
