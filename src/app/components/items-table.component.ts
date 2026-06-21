import { Component, input, output } from '@angular/core';
import { ItemsInterface } from '../interfaces/items.interface';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from './button.component';

@Component({
    selector: 'app-items-table',
    imports: [TableModule, InputTextModule, FormsModule, ButtonComponent],
    template: `
        <p-table [value]="items()" dataKey="slNo" styleClass="p-datatable-sm">
            <ng-template #header>
                <tr>
                    <th>Sl. No</th>
                    <th>Item</th>
                    <th>MRP / Net</th>
                    <th>Quantity</th>
                    <th>Discount</th>
                    <th>Sub-total</th>
                    <th>Action</th>
                </tr>
            </ng-template>
            <ng-template #body let-item let-editing="editing">
                <tr>
                    <td>{{ item.slNo }}</td>
                    <td>{{ item.item }}</td>
                    <td [pEditableColumn]="item.mrpOrNet" pEditableColumnField="mrpOrNet">
                        <p-cellEditor>
                            <ng-template #input>
                                <input
                                    pInputText
                                    type="text"
                                    [(ngModel)]="item.mrpOrNet"
                                    (keydown.enter)="editClickedForMrpOrNet(item)"
                                    (blur)="editClickedForMrpOrNet(item)"
                                    fluid
                                />
                            </ng-template>
                            <ng-template #output>
                                {{ item.mrpOrNet }}
                            </ng-template>
                        </p-cellEditor>
                    </td>
                    <td [pEditableColumn]="item.quantity" pEditableColumnField="quantity">
                        <p-cellEditor>
                            <ng-template #input>
                                <input
                                    pInputText
                                    type="text"
                                    [(ngModel)]="item.quantity"
                                    (keydown.enter)="editClickedForQuantity(item)"
                                    (blur)="editClickedForQuantity(item)"
                                    fluid
                                />
                            </ng-template>
                            <ng-template #output>
                                {{ item.quantity }}
                            </ng-template>
                        </p-cellEditor>
                    </td>
                    <td>{{ item.discount }}</td>
                    <td>₹{{ item.subTotal }}</td>
                    <td>
                        <app-button
                            variant="secondary"
                            width="w-auto"
                            (buttonClicked)="deleteClicked(item.slNo)"
                        >
                            Delete
                        </app-button>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `,
})
export class ItemsTableComponent {
    items = input.required<ItemsInterface[]>();
    toEdit = output<ItemsInterface>();
    toDelete = output<number>();

    editClickedForMrpOrNet(item: ItemsInterface): void {
        this.toEdit.emit({
            slNo: item.slNo,
            item: item.item,
            mrpOrNet: item.mrpOrNet,
            quantity: item.quantity,
            discount: item.discount,
            subTotal: item.subTotal,
        });
    }

    editClickedForQuantity(item: ItemsInterface): void {
        this.toEdit.emit({
            slNo: item.slNo,
            item: item.item,
            mrpOrNet: item.mrpOrNet,
            quantity: item.quantity,
            discount: item.discount,
            subTotal: item.subTotal,
        });
    }

    deleteClicked(slNo: number): void {
        this.toDelete.emit(slNo);
    }
}