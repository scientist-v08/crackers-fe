import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ExpenseInterface } from '../../../interfaces/expenses.interface';

@Component({
    selector: 'app-expenses-table',
    imports: [TableModule],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <p-table [value]="expenses()" dataKey="ID" styleClass="p-datatable-sm">
            <ng-template #header>
                <tr>
                    <th>Sl. No</th>
                    <th>Reason for Expense</th>
                    <th>Amount</th>
                </tr>
            </ng-template>
            <ng-template #body let-item let-rowIndex="rowIndex">
                <tr>
                    <td>{{ rowIndex + 1 }}</td>
                    <td>{{ item.reasonForExpense }}</td>
                    <td>₹{{ item.amount }}</td>
                </tr>
            </ng-template>
        </p-table>
    `,
})
export class ExpensesTableComponent {
    expenses = input.required<ExpenseInterface[]>();
}
