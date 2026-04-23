import { Component, input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ExpenseInterface } from '../../../interfaces/expenses.interface';

@Component({
    selector: 'app-expenses-table',
    imports: [TableModule],
    template: `
        <p-table [value]="expenses()" dataKey="ID">
            <ng-template #header>
                <tr>
                    <th>Sl.No</th>
                    <th>Reson for expense</th>
                    <th>Amount</th>
                </tr>
            </ng-template>
            <ng-template #body let-item>
                <tr>
                    <td>{{ item.ID }}</td>
                    <td>{{ item.ReasonForExpense }}</td>
                    <td>{{ item.Amount }}</td>
                </tr>
            </ng-template>
        </p-table>
    `,
})
export class ExpensesTableComponent {
    expenses = input.required<ExpenseInterface[]>();
}
