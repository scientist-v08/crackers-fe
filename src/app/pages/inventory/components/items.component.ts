import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Toast } from 'primeng/toast';
import { catchError, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ButtonComponent } from './button.component';
import { SpinnerComponent } from '../../../components/spinner.component';
import { InventoryStateOrdered } from '../../../constants/inventory.constants';
import { InventoryItem } from '../../../interfaces/inventory.interface';
import { InventoryService } from '../../../services/inventory.service';
import { AddItemComponent } from './addItem.component';
import { CompleteComponent } from './complete.component';
import { InventoryItemsTableComponent } from './items-table.component';
import { Store } from '@ngrx/store';
import { selectInventoryQueryParams } from '../../../store/inventory.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { InventoryActions } from '../../../store/inventory.actions';
import * as InventorySelectors from '../../../store/inventory.selectors';

@Component({
    selector: 'app-items',
    standalone: true,
    imports: [
        InputTextModule,
        ReactiveFormsModule,
        ButtonComponent,
        PaginatorModule,
        AddItemComponent,
        Toast,
        CompleteComponent,
        SpinnerComponent,
        InventoryItemsTableComponent,
    ],
    template: `
        <div class="toolbar">
            @if (showAddItem()) {
                <app-add-item (toaster)="messageService($event)" />
            }
            <form class="toolbar-group" [formGroup]="searchForm">
                <div class="form-field toolbar-field">
                    <input
                        id="searchItem"
                        class="form-control"
                        [class]="searchBoxInvalidClass()"
                        pInputText
                        formControlName="item"
                        autocomplete="off"
                        placeholder="Search item by name"
                    />
                    <div class="flex mt-4 md:hidden flex-row justify-between items-center">
                        <app-button [width]="'w-auto'" (buttonClicked)="searchItems()"
                            >Search</app-button
                        >
                        <app-button
                            variant="secondary"
                            [width]="'w-auto'"
                            (buttonClicked)="refreshItems()"
                        >
                            Refresh
                        </app-button>
                    </div>
                </div>
                <div
                    class="hidden gap-3 md:flex md:flex-row md:flex-wrap md:items-center md:shrink-0"
                >
                    <app-button [width]="'w-auto'" (buttonClicked)="searchItems()"
                        >Search</app-button
                    >
                    <app-button
                        variant="secondary"
                        [width]="'w-auto'"
                        (buttonClicked)="refreshItems()"
                    >
                        Refresh
                    </app-button>
                </div>
            </form>
        </div>

        <div class="card-body">
            @if (allItems().length === 0 && !loadingData()) {
                <p class="empty-state">No inventory items found</p>
            }

            @if (!loadingData()) {
                @if (allItems().length > 0) {
                    <app-inventory-items-table
                        [allItems]="allItems()"
                        class="hidden md:block"
                        (changeState)="changeState($event)"
                        (partialSuccessMessageService)="partialSuccessMessageService($event)"
                    />
                    <div class="data-stack md:hidden">
                        @for (item of allItems(); track item.ID) {
                            <div class="data-card">
                                <div class="data-card-header">
                                    {{ item.BrandOrCompany }}: {{ item.Item }}
                                </div>
                                <div class="data-row">
                                    <span class="data-row-label">Boxes per carton</span>
                                    <span class="data-row-value">{{ item.NumOfBoxes }}</span>
                                </div>
                                <div class="data-row">
                                    <span class="data-row-label">Number of cartons</span>
                                    <span class="data-row-value">{{ item.NumOfCartons }}</span>
                                </div>
                                <div class="data-row">
                                    <span class="data-row-label">Price per carton</span>
                                    <span class="data-row-value">₹{{ item.PricePerCarton }}</span>
                                </div>
                                <div class="data-row">
                                    <span class="data-row-label">Subtotal</span>
                                    <span class="data-row-value">₹{{ item.SubTotal }}</span>
                                </div>
                                @if (inventoryState() !== 'Unpacked') {
                                    <div class="section-actions">
                                        <app-complete
                                            [itemToBeCompleted]="item"
                                            (toaster)="changeState($event)"
                                            (toasterForPartial)="
                                                partialSuccessMessageService($event)
                                            "
                                        />
                                    </div>
                                }
                            </div>
                        }
                    </div>
                    <p-paginator
                        [first]="first()"
                        [rows]="rows()"
                        [totalRecords]="totalElements()"
                        [rowsPerPageOptions]="[5, 10, 15]"
                        (onPageChange)="onPageChange($event)"
                    />
                }
            } @else {
                <app-spinner class="flex items-center justify-center py-12" />
            }
        </div>
        <p-toast position="bottom-right" key="br" />
    `,
    providers: [MessageService],
})
export class ItemsComponent implements OnInit, OnDestroy {
    #inventoryService = inject(InventoryService);
    #store = inject(Store);
    #fb = inject(FormBuilder);
    #messageService = inject(MessageService);

    // Local UI state
    allItems = signal<InventoryItem[]>([]);
    total = signal<number>(1);
    totalEmit = output<number>();
    totalElements = signal<number>(0);
    pageNumber = signal<number>(1);
    pageSize = signal<number>(5);
    first = signal<number>(0);
    rows = signal<number>(5);
    title = signal<string>('');
    searchBoxInvalidClass = signal<string>('');
    showAddItem = signal<boolean>(false);
    state = signal<string>('');
    loadingData = signal<boolean>(false);
    inventoryState = toSignal(this.#store.select(InventorySelectors.selectSelectedTab), {
        initialValue: InventoryStateOrdered,
    });
    searchForm = this.#fb.group({
        item: this.#fb.control('', [Validators.required]),
    });
    unsubscribe$ = new Subject<void>();
    private queryParams$ = this.#store.select(selectInventoryQueryParams);

    public ngOnInit(): void {
        this.storeChanges();
    }

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    private errorHandler(err: HttpErrorResponse): void {
        let errorMsg = 'An unexpected error occurred';

        if (err.error && typeof err.error === 'object') {
            if (err.error.error) {
                errorMsg = err.error.error;
            } else if (err.error.message) {
                errorMsg = err.error.message;
            }
        } else if (typeof err.error === 'string') {
            errorMsg = err.error;
        } else if (err.message) {
            errorMsg = err.message;
        }
        this.messageService({ type: 'error', message: errorMsg });
    }

    public searchItems(): void {
        if (this.searchForm.invalid) {
            this.searchBoxInvalidClass.set('ng-invalid ng-dirty');
        }
        this.searchBoxInvalidClass.set('');
        const title = this.searchForm.controls.item.getRawValue() ?? '';
        this.#store.dispatch(InventoryActions.setSearch({ title }));
    }

    public refreshItems(): void {
        this.searchBoxInvalidClass.set('');
        this.searchForm.reset({ item: '' });
        this.#store.dispatch(InventoryActions.setSearch({ title: '' }));
        this.#store.dispatch(InventoryActions.refreshItems());
    }

    onPageChange(event: PaginatorState) {
        const pageNumber = (event.page ?? 0) + 1;
        const pageSize = event.rows ?? 5;
        this.pageNumber.set(pageNumber);
        this.pageSize.set(pageSize);
        this.first.set(event.first ?? 0);
        this.rows.set(event.rows ?? 5);
        this.allItems.set([]);
        this.#store.dispatch(
            InventoryActions.setPagination({
                pageNumber: (event.page ?? 0) + 1,
                pageSize: event.rows ?? 5,
                first: event.first ?? 0,
            }),
        );
    }

    messageService(event: { type: string; message: string }): void {
        this.#messageService.add({
            severity: event.type,
            summary: event.type,
            detail: event.message,
            key: 'br',
            life: 3000,
        });
        if (event.type === 'success') {
            this.refreshItems();
        }
    }

    partialSuccessMessageService(event: {
        type: string;
        message: string;
        id: number;
        numOfCartons: number;
    }): void {
        this.#messageService.add({
            severity: event.type,
            summary: event.type,
            detail: event.message,
            key: 'br',
            life: 3000,
        });
        if (event.type === 'success') {
            this.allItems.update((items) => {
                const updatedItems = items.map((itemToUpdate) => {
                    if (itemToUpdate.ID === event.id) {
                        const newNumOfCartons = itemToUpdate.NumOfCartons - event.numOfCartons;
                        return {
                            ...itemToUpdate,
                            NumOfCartons: newNumOfCartons,
                            SubTotal: newNumOfCartons * itemToUpdate.PricePerCarton,
                        };
                    }
                    return itemToUpdate;
                });

                // Calculate new total after update
                const newTotal = updatedItems.reduce((acc, curr) => acc + curr.SubTotal, 0);
                this.total.set(newTotal);
                this.#store.dispatch(InventoryActions.setTotal({ amt: newTotal }));

                return updatedItems;
            });
        }
    }

    changeState(type: { type: string; message: string }): void {
        if (type.type === 'error') {
            this.messageService(type);
        } else {
            this.#messageService.add({
                severity: type.type,
                summary: type.type,
                detail: type.message,
                key: 'br',
                life: 3000,
            });
            const firstCondition = this.totalElements() % this.pageSize() === 1;
            const secondCondition =
                Math.ceil(this.totalElements() / this.pageSize()) === this.pageNumber();
            if (firstCondition && secondCondition) {
                this.refreshItems();
            } else {
                this.allItems.set([]);
                this.#store.dispatch(InventoryActions.refreshItems());
            }
        }
    }

    private storeChanges(): void {
        this.queryParams$
            .pipe(
                tap((params) => {
                    this.showAddItem.set(params.tab === InventoryStateOrdered);
                    this.loadingData.set(true);
                    this.allItems.set([]); // optional: clear while loading
                }),
                switchMap((params) =>
                    this.#inventoryService
                        .getAllInventoryItems(
                            params.pageNumber,
                            params.pageSize,
                            params.title,
                            params.tab,
                        )
                        .pipe(
                            catchError((err) => {
                                this.errorHandler(err);
                                return of(null); // prevent stream from dying
                            }),
                        ),
                ),
                takeUntil(this.unsubscribe$),
            )
            .subscribe((res) => {
                this.loadingData.set(false);
                if (!res) return;

                this.allItems.set(res.inventoryItems);
                this.total.set(res.total);
                this.#store.dispatch(InventoryActions.setTotal({ amt: res.total }));
                this.totalElements.set(res.totalElements);
            });
    }
}
