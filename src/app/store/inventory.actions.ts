import { createAction, createActionGroup, emptyProps, props } from '@ngrx/store';
import { InventoryState } from '../constants/inventory.constants';
import { InventoryItem } from '../interfaces/inventory.interface';

export const InventoryActions = createActionGroup({
    source: 'Inventory',
    events: {
        'Set Tab': props<{ tab: InventoryState }>(),
        'Set Search': props<{ title: string }>(),
        'Set Pagination': props<{ pageNumber: number; pageSize: number; first: number }>(),
        'Load Items Success': props<{
            items: InventoryItem[];
            total: number;
            totalElements: number;
        }>(),
        'Refresh Items': emptyProps(),
        'Partial Update Item': props<{ id: number; numOfCartons: number }>(),
        'Remove Item': props<{ id: number }>(),
        'Set Total': props<{ amt: number }>(),
    },
});
