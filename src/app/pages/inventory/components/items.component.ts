import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Toast } from 'primeng/toast';
import { Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ButtonComponent } from './button.component';
import { SpinnerComponent } from '../../../components/spinner.component';
import { InventoryState } from '../../../constants/inventory.constants';
import { InventoryItem, InventoryResponseInterface } from '../../../interfaces/inventory.interface';
import { InventoryService } from '../../../services/inventory.service';
import { AddItemComponent } from './addItem.component';
import { CompleteComponent } from './complete.component';
import { InventoryItemsTableComponent } from './items-table.component';

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
                <app-add-item class="hidden sm:block" (toaster)="messageService($event)" />
            }
            <form class="toolbar-group" [formGroup]="searchForm">
                <div class="form-field toolbar-field">
                    <label class="form-label" for="searchItem">Search Item</label>
                    <input
                        id="searchItem"
                        class="form-control"
                        [class]="searchBoxInvalidClass()"
                        pInputText
                        formControlName="item"
                        autocomplete="off"
                        placeholder="Enter item name"
                    />
                </div>
                <div class="btn-group sm:shrink-0">
                    <app-button [width]="'w-auto'" (buttonClicked)="searchItems()">Search</app-button>
                    <app-button variant="secondary" [width]="'w-auto'" (buttonClicked)="refreshItems()">
                        Refresh
                    </app-button>
                </div>
            </form>
            @if (showAddItem()) {
                <app-add-item class="block sm:hidden" (toaster)="messageService($event)" />
            }
        </div>

        <div class="card-body">
        @if (allItems().length === 0 && !loadingData()) {
            <p class="empty-state">No inventory items found</p>
        }

        @if (!loadingData()) {
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
                                    (toasterForPartial)="partialSuccessMessageService($event)"
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
    #fb = inject(FormBuilder);
    #messageService = inject(MessageService);
    searchForm = this.#fb.group({
        item: this.#fb.control('', [Validators.required]),
    });
    unsubscribe$ = new Subject<void>();
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
    inventoryState = this.#inventoryService.state;

    public ngOnInit(): void {
        this.getItems();
    }

    public ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    private getItems(): void {
        this.first.set(0);
        this.allItems.set([]);
        this.#inventoryService.stateObservable$
            .pipe(
                switchMap((res: InventoryState) => {
                    if (res === 'Ordered') {
                        this.showAddItem.set(true);
                    } else {
                        this.showAddItem.set(false);
                    }
                    this.state.set(res);
                    this.pageNumber.set(1);
                    this.pageSize.set(5);
                    return this.#inventoryService
                        .getAllInventoryItems(
                            this.pageNumber(),
                            this.pageSize(),
                            this.title(),
                            this.state(),
                        )
                        .pipe(tap(() => this.loadingData.set(true)));
                }),
                takeUntil(this.unsubscribe$),
            )
            .subscribe({
                next: (res: InventoryResponseInterface) => {
                    this.loadingData.set(false);
                    this.allItems.set(res.inventoryItems);
                    this.total.set(res.total);
                    this.totalEmit.emit(res.total);
                    this.totalElements.set(res.totalElements);
                },
                error: (err: HttpErrorResponse) => {
                    this.loadingData.set(false);
                    this.totalEmit.emit(0);
                    this.errorHandler(err);
                },
            });
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
        } else {
            this.searchBoxInvalidClass.set('');
            this.title.set(this.searchForm.controls.item.getRawValue() ?? '');
            this.getItems();
        }
    }

    public refreshItems(): void {
        this.searchBoxInvalidClass.set('');
        this.title.set('');
        this.searchForm.reset({ item: '' });
        this.getItems();
    }

    onPageChange(event: PaginatorState) {
        const pageNumber = (event.page ?? 0) + 1;
        const pageSize = event.rows ?? 5;
        this.pageNumber.set(pageNumber);
        this.pageSize.set(pageSize);
        this.first.set(event.first ?? 0);
        this.rows.set(event.rows ?? 5);
        this.allItems.set([]);
        this.#inventoryService
            .getAllInventoryItems(this.pageNumber(), this.pageSize(), this.title(), this.state())
            .pipe(
                tap(() => this.loadingData.set(true)),
                takeUntil(this.unsubscribe$),
            )
            .subscribe({
                next: (res: InventoryResponseInterface) => {
                    this.loadingData.set(false);
                    this.allItems.set(res.inventoryItems);
                },
                error: (err: HttpErrorResponse) => {
                    this.loadingData.set(false);
                    this.errorHandler(err);
                },
            });
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
            this.allItems.update((item) => {
                const updatedItems = item.map((itemToUpdate) => {
                    if (itemToUpdate.ID === event.id) {
                        return {
                            ...itemToUpdate,
                            NumOfCartons: itemToUpdate.NumOfCartons - event.numOfCartons,
                        };
                    }
                    return itemToUpdate;
                });
                return updatedItems;
            });
        }
    }

    changeState(type: { type: string; message: string }): void {
        if (type.type === 'error') {
            this.messageService(type);
        } else {
            const firstCondition = this.totalElements() % this.pageSize() === 1;
            const secondCondition =
                Math.ceil(this.totalElements() / this.pageSize()) === this.pageNumber();
            if (firstCondition && secondCondition) {
                this.refreshItems();
            } else {
                this.allItems.set([]);
                this.#inventoryService
                    .getAllInventoryItems(
                        this.pageNumber(),
                        this.pageSize(),
                        this.title(),
                        this.state(),
                    )
                    .pipe(
                        tap(() => this.loadingData.set(true)),
                        takeUntil(this.unsubscribe$),
                    )
                    .subscribe({
                        next: (res: InventoryResponseInterface) => {
                            this.loadingData.set(false);
                            this.allItems.set(res.inventoryItems);
                            this.total.set(res.total);
                            this.totalEmit.emit(res.total);
                            this.totalElements.update((value) => value - 1);
                        },
                        error: (err: HttpErrorResponse) => {
                            this.loadingData.set(false);
                            this.totalEmit.emit(0);
                            this.errorHandler(err);
                        },
                    });
            }
        }
    }
}
