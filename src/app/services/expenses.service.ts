import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import {
  AddExpenseInterface,
  AddExpenseSuccess,
  ExpenseResponseInterface,
} from '../interfaces/expenses.interface';

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  #http = inject(HttpClient);
  url = environment.baseUrl;

  getAllExpenses(): Observable<ExpenseResponseInterface> {
    const url = this.url + 'get/expenses';
    return this.#http.get<ExpenseResponseInterface>(url);
  }

  addExpense(reqbody: AddExpenseInterface): Observable<AddExpenseSuccess> {
    const url = this.url + 'post/expenses';
    return this.#http.post<AddExpenseSuccess>(url, reqbody);
  }
}
