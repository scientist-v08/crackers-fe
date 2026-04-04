import { InventoryState } from '../constants/inventory.constants';

export interface InventoryResponseInterface {
  inventoryItems: InventoryItem[];
  total: number;
  totalElements: number;
}

export interface InventoryItem {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: any;
  BrandOrCompany: string;
  State: string;
  Item: string;
  NumOfBoxes: number;
  NumOfCartons: number;
  PricePerCarton: number;
  SubTotal: number;
}

export interface NewInventoryItem {
  brandOrCompany: string;
  state: string;
  item: string;
  numberOfBoxes: number;
  numberOfCartons: number;
  pricePerCarton: number;
  subtotal: number;
}
