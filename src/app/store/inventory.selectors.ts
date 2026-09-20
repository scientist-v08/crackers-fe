import { createSelector } from '@ngrx/store';
import { inventoryFeature } from './inventory.reducer'; // or .feature

// Re-export the auto-generated ones for convenience
export const {
    selectInventoryState,
    selectSelectedTab,
    selectSearchTitle,
    selectPageNumber,
    selectPageSize,
    selectFirst,
    selectItems,
    selectTotal,
    selectTotalElements,
    selectRefreshCounter,
} = inventoryFeature;

// Composed / custom selectors
export const selectPagination = createSelector(
    selectPageNumber,
    selectPageSize,
    selectFirst,
    (pageNumber, pageSize, first) => ({ pageNumber, pageSize, first }),
);

export const selectInventoryQueryParams = createSelector(
    selectSelectedTab,
    selectSearchTitle,
    selectPagination,
    selectRefreshCounter,
    (tab, title, pagination, refreshCounter) => ({
        tab,
        title,
        ...pagination,
        refreshCounter,
    }),
);
