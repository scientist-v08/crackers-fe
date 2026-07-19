export interface ExpenseResponseInterface {
    expenses: ExpenseInterface[];
    total: number;
}

export interface ExpenseInterface {
    id: number;
    reasonForExpense: string;
    amount: number;
}

export interface AddExpenseInterface {
    reasonForExpense: string;
    amount: number;
}

export interface AddExpenseSuccess {
    success: string;
}
