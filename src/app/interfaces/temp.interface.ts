export interface GetAllSavedBills {
    id: number;
    comments: string;
    finalizedAmt: number;
}

export interface TempBillDetailsInterface {
    user: string;
    mobile: string;
    grandTotal: number;
    finalizedAmt: number;
    comments: string;
    discount: string;
    tempBillItems: TempBillItemInterface[];
}

export interface TempBillItemInterface {
    mrpOrNet: number;
    item: string;
    quantity: number;
    discount: string;
    subTotal: number;
}

export interface TempBillResponseInterface {
    success: boolean;
    message: string;
}

export interface SavedTempBillResponseInterface {
    id: number;
    user: string;
    mobile: string;
    comments: string;
    grandTotal: number;
    finalizedAmt: number;
    items: SavedTempBillItemInterface[];
}

export interface SavedTempBillItemInterface {
    mrpOrNet: number;
    item: string;
    quantity: number;
    discount: string;
    subTotal: number;
}
