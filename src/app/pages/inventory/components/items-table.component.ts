import { Component, inject, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InventoryItem } from '../../../interfaces/inventory.interface';
import { InventoryService } from '../../../services/inventory.service';
import { CompleteComponent } from './complete.component';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import {
    InventoryStateOrdered,
    InventoryStateUnpacked,
} from '../../../constants/inventory.constants';
import * as InventorySelectors from '../../../store/inventory.selectors';

@Component({
    selector: 'app-inventory-items-table',
    imports: [TableModule, CompleteComponent],
    template: `
        <p-table [value]="allItems()" dataKey="ID" styleClass="p-datatable-sm">
            <ng-template #header>
                <tr>
                    <th>Item</th>
                    <th>Boxes per carton</th>
                    <th>Number of cartons</th>
                    <th>Price per carton</th>
                    <th>Subtotal</th>
                    @if (inventoryState() !== 'Unpacked') {
                        <th>Actions</th>
                    }
                </tr>
            </ng-template>
            <ng-template #body let-item>
                <tr>
                    <td>{{ item.BrandOrCompany }}: {{ item.Item }}</td>
                    <td>{{ item.NumOfBoxes }}</td>
                    <td>{{ item.NumOfCartons }}</td>
                    <td>₹{{ item.PricePerCarton }}</td>
                    <td>₹{{ item.SubTotal }}</td>
                    @if (inventoryState() !== 'Unpacked') {
                        <td>
                            <app-complete
                                class="items-center md:flex-row flex flex-col justify-center md:gap-2"
                                [itemToBeCompleted]="item"
                                (toaster)="changeState.emit($event)"
                                (toasterForPartial)="partialSuccessMessageService.emit($event)"
                            />
                        </td>
                    }
                </tr>
            </ng-template>
        </p-table>
    `,
})
export class InventoryItemsTableComponent {
    #store = inject(Store);
    allItems = input.required<InventoryItem[]>();
    changeState = output<{ type: string; message: string }>();
    partialSuccessMessageService = output<{
        type: string;
        message: string;
        id: number;
        numOfCartons: number;
    }>();
    inventoryState = toSignal(this.#store.select(InventorySelectors.selectSelectedTab), {
        initialValue: InventoryStateOrdered,
    });
}
