import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Toast } from 'primeng/toast';
import { Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ButtonComponent } from '../../../components/button.component';
import { SpinnerComponent } from '../../../components/spinner.component';
import { InventoryState } from '../../../constants/inventory.constants';
import { InventoryItem, InventoryResponseInterface } from '../../../interfaces/inventory.interface';
import { InventoryService } from '../../../services/inventory.service';
import { AddItemComponent } from './addItem.component';
import { CompleteComponent } from './complete.component';

@Component({
    selector: 'app-items',
    standalone: true,
    imports: [
        CardModule,
        InputTextModule,
        ReactiveFormsModule,
        FloatLabel,
        ButtonComponent,
        PaginatorModule,
        AddItemComponent,
        Toast,
        CompleteComponent,
        SpinnerComponent,
    ],
    template: `
        <div class="flex items-center justify-center flex-col md:flex-row md:justify-between">
            @if (showAddItem()) {
                <app-add-item (toaster)="messageService($event)" />
            }
            <h2 class="text-3xl font-semibold text-indigo-900 dark:text-amber-300 mb-4">
                Total cost of goods: ₹{{ total() }}
            </h2>
        </div>
        <div
            class="flex gap-2 flex-col items-center justify-center md:flex-row md:items-center md:justify-between mb-4"
        >
            <form
                class="flex gap-2 flex-col md:flex-row items-center justify-center"
                [formGroup]="searchForm"
            >
                <p-floatlabel class="md:mr-2" variant="on">
                    <input
                        id="on_label"
                        [class]="searchBoxInvalidClass()"
                        pInputText
                        formControlName="item"
                        autocomplete="off"
                    />
                    <label for="on_label">Search Item</label>
                </p-floatlabel>
                <app-button class="md:mr-2" (buttonClicked)="searchItems()">Search</app-button>
                <app-button (buttonClicked)="refreshItems()">Refresh</app-button>
            </form>
            <p-paginator
                [first]="first()"
                [rows]="rows()"
                [totalRecords]="totalElements()"
                [rowsPerPageOptions]="[5, 10, 15]"
                (onPageChange)="onPageChange($event)"
            />
        </div>
        @if (allItems().length === 0 && !loadingData()) {
            <div class="text-black dark:text-white text-3xl">No data</div>
        }
        @if (!loadingData()) {
            <div class="mb-2 rounded-lg grid md:grid-cols-3 gap-4">
                @for (item of allItems(); track item.ID) {
                    <p-card
                        class="bg-gray-100 dark:bg-gray-900"
                        header="{{ item.BrandOrCompany }}: {{ item.Item }}"
                    >
                        <div class="flex justify-between items-center">
                            <div>Number of boxes per carton:</div>
                            <div>{{ item.NumOfBoxes }}</div>
                        </div>
                        <div class="flex justify-between items-center">
                            <div>Number of cartons:</div>
                            <div>{{ item.NumOfCartons }}</div>
                        </div>
                        <div class="flex justify-between items-center">
                            <div>Price per carton:</div>
                            <div>{{ item.PricePerCarton }}</div>
                        </div>
                        <div class="flex justify-between items-center">
                            <div>Subtotal:</div>
                            <div>{{ item.SubTotal }}</div>
                        </div>
                        <div class="items-center flex justify-center md:justify-start">
                            @if (inventoryState() !== 'Unpacked') {
                                <app-complete
                                    class="items-center md:flex-row flex flex-col justify-center md:gap-2"
                                    [itemToBeCompleted]="item"
                                    (toaster)="changeState($event)"
                                    (toasterForPartial)="partialSuccessMessageService($event)"
                                />
                            }
                        </div>
                    </p-card>
                }
            </div>
        } @else {
            <app-spinner class="flex items-center justify-center" />
        }
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
                    this.totalElements.set(res.totalElements);
                },
                error: (err: HttpErrorResponse) => {
                    this.loadingData.set(false);
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
            this.allItems.update(item => {
                const updatedItems = item.map(itemToUpdate => {
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
                            this.totalElements.update(value => value - 1);
                        },
                        error: (err: HttpErrorResponse) => {
                            this.loadingData.set(false);
                            this.errorHandler(err);
                        },
                    });
            }
        }
    }
}
