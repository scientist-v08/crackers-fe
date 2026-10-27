import { InventoryState } from '../constants/inventory.constants';

export interface InventoryResponseInterface {
    inventoryItems: InventoryItem[];
    total: number;
    totalElements: number;
}

export interface InventoryItem {
    id: number;
    brandOrCompany: string;
    state: string;
    item: string;
    numOfBoxes: number;
    numOfCartons: number;
    pricePerCarton: number;
    subTotal: number;
}

export interface NewInventoryItem {
    brandOrCompany: string;
    state: string;
    item: string;
    numOfBoxes: number;
    numOfCartons: number;
    pricePerCarton: number;
    subtotal: number;
}
