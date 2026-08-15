export type ProductList = BrandProduct[];

export interface BrandProduct {
    brand: string;
    list: List[];
}

export interface List {
    id: number;
    price: number;
    item: string;
}
