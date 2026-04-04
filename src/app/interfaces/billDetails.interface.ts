import { ItemsInterface } from './items.interface';

export interface BillDetailsInterface {
    user: string;
    mobile: string;
    grandTotal: number;
    billItems: ItemsInterface[];
    finalizedAmt: number;
}

export interface BillResponseInterface {
    file: Blob;
    filename: string;
}
