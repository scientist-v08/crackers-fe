import { createFeature, createReducer, on } from '@ngrx/store';
import { InventoryState, InventoryStateOrdered } from '../constants/inventory.constants';
import { InventoryItem } from '../interfaces/inventory.interface';
import { InventoryActions } from './inventory.actions';

export interface InventoryStoreState {
    selectedTab: InventoryState;
    searchTitle: string;
    pageNumber: number;
    pageSize: number;
    first: number;
    items: InventoryItem[];
    total: number;
    totalElements: number;
    refreshCounter: number;
}

export const initialState: InventoryStoreState = {
    selectedTab: InventoryStateOrdered,
    searchTitle: '',
    pageNumber: 1,
    pageSize: 5,
    first: 0,
    items: [],
    total: 0,
    totalElements: 0,
    refreshCounter: 0,
};

export const inventoryFeature = createFeature({
    name: 'inventory',
    reducer: createReducer(
        initialState,
        on(InventoryActions.setTab, (state, { tab }) => ({
            ...state,
            selectedTab: tab,
            pageNumber: 1,
            first: 0,
            refreshCounter: state.refreshCounter + 1,
            items: [], // Clear items on tab change to show loading
        })),
        on(InventoryActions.setTotal, (state, { amt }) => ({
            ...state,
            total: amt,
        })),
        on(InventoryActions.setSearch, (state, { title }) => ({
            ...state,
            searchTitle: title,
            pageNumber: 1,
            first: 0,
            refreshCounter: state.refreshCounter + 1,
        })),
        on(InventoryActions.setPagination, (state, { pageNumber, pageSize, first }) => ({
            ...state,
            pageNumber,
            pageSize,
            first,
            refreshCounter: state.refreshCounter + 1,
        })),
        on(InventoryActions.loadItemsSuccess, (state, { items, total, totalElements }) => ({
            ...state,
            items,
            total,
            totalElements,
        })),
        on(InventoryActions.refreshItems, (state) => ({
            ...state,
            refreshCounter: state.refreshCounter + 1,
        })),
        on(InventoryActions.partialUpdateItem, (state, { id, numOfCartons }) => {
            const updatedItems = state.items.map((item) => {
                if (item.ID === id) {
                    const newNumOfCartons = item.NumOfCartons - numOfCartons;
                    return {
                        ...item,
                        NumOfCartons: newNumOfCartons,
                        SubTotal: newNumOfCartons * item.PricePerCarton,
                    };
                }
                return item;
            });

            const newTotal = updatedItems.reduce((acc, curr) => acc + curr.SubTotal, 0);

            return {
                ...state,
                items: updatedItems,
                total: newTotal,
            };
        }),
        on(InventoryActions.removeItem, (state, { id }) => {
            const updatedItems = state.items.filter((item) => item.ID !== id);
            const newTotal = updatedItems.reduce((acc, curr) => acc + curr.SubTotal, 0);
            return {
                ...state,
                items: updatedItems,
                total: newTotal,
                totalElements: state.totalElements - 1,
            };
        }),
    ),
});
