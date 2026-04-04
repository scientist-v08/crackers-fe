export interface ExpenseResponseInterface {
  expenses: ExpenseInterface[];
  total: number;
}

export interface ExpenseInterface {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: any;
  ReasonForExpense: string;
  Amount: number;
}

export interface AddExpenseInterface {
  reasonForExpense: string;
  amount: number;
}

export interface AddExpenseSuccess {
  Success: string;
}
