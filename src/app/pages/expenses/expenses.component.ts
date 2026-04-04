import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, takeUntil, tap } from 'rxjs';
import { ExpensesService } from '../../services/expenses.service';
import {
  ExpenseInterface,
  ExpenseResponseInterface,
} from '../../interfaces/expenses.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { SpinnerComponent } from '../../components/spinner.component';
import { CardModule } from 'primeng/card';
import { AddExpenseComponent } from './components/add-expense.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [Toast, SpinnerComponent, CardModule, AddExpenseComponent],
  templateUrl: './expenses.component.html',
  providers: [MessageService],
})
export default class ExpensesComponent implements OnInit, OnDestroy {
  #expenseService = inject(ExpensesService);
  #messageService = inject(MessageService);
  unsubscribe$ = new Subject<void>();
  allExpenses = signal<ExpenseInterface[]>([]);
  loadingData = signal<boolean>(false);
  totalExpenses = signal<number>(0);

  public ngOnInit(): void {
    this.getAllExpenses();
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getAllExpenses(): void {
    this.#expenseService
      .getAllExpenses()
      .pipe(
        tap(() => this.loadingData.set(true)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe({
        next: (res: ExpenseResponseInterface) => {
          this.loadingData.set(false);
          this.allExpenses.set(res.expenses);
          this.totalExpenses.set(res.total);
        },
        error: (err: HttpErrorResponse) => {
          this.loadingData.set(false);
          this.errorHandler(err);
        },
      });
  }

  private errorHandler(err: HttpErrorResponse): void {
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
    this.#messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMsg,
      key: 'br',
      life: 3000,
    });
  }

  successToast(): void {
    this.getAllExpenses();
    this.#messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Expense added',
      key: 'br',
      life: 3000,
    });
  }

  errToast(err: HttpErrorResponse): void {
    this.errorHandler(err);
  }
}
