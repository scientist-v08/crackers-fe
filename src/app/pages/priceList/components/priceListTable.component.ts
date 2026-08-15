import { Component, input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { List } from '../../../interfaces/priceList.interface';

@Component({
    selector: 'app-price-list-table',
    template: `
        <p-table [value]="priceList()" dataKey="id" class="p-datatable-sm">
            <ng-template #header>
                <tr>
                    <th>Item</th>
                    <th>Price</th>
                </tr>
            </ng-template>
            <ng-template #body let-item>
                <tr>
                    <td>{{ item.item }}</td>
                    <td>₹{{ item.price }}</td>
                </tr>
            </ng-template>
        </p-table>
    `,
    imports: [TableModule],
})
export class PriceListTableComponent {
    priceList = input.required<List[]>();
}
