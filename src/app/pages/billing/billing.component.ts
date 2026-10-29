import {
    AfterViewChecked,
    Component,
    computed,
    ElementRef,
    inject,
    OnDestroy,
    signal,
    viewChild,
    ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { Subject, takeUntil, tap } from 'rxjs';
import { BillComparisonComponent } from '../../components/bill-comparison.component';
import { GrandTotalComponent } from '../../components/grand-total.component';
import { ItemsClass } from '../../components/items.component';
import { SpinnerComponent } from '../../components/spinner.component';
import {
    categoryDropdown,
    companyDropdown,
    discountDropDownOptions,
} from '../../constants/billing.constants';
import { BillComparisonInterface } from '../../interfaces/billComparison.interface';
import {
    BillDetailsInterface,
    BillResponseInterface,
} from '../../interfaces/billDetails.interface';
import { DiscountDropdownInterface } from '../../interfaces/discountDropdown.interface';
import { DropdownInterface } from '../../interfaces/dropdown.interface';
import { ItemsInterface } from '../../interfaces/items.interface';
import { BillingService } from '../../services/billing.service';
import { ItemsTableComponent } from '../../components/items-table.component';
import { ButtonFullWidth } from '../../components/button-full-width.component';
import { SavedBillsComponent } from './saved-bills/saved-bills.component';
import {
    SavedTempBillResponseInterface,
    TempBillDetailsInterface,
    TempBillResponseInterface,
} from '../../interfaces/temp.interface';
import { minLengthAfterTrim } from '../expenses/components/add-expense.component';
import { ButtonComponent } from '../inventory/components/button.component';

@Component({
    selector: 'app-billing',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        ItemsClass,
        GrandTotalComponent,
        BillComparisonComponent,
        Dialog,
        SpinnerComponent,
        Toast,
        ItemsTableComponent,
        ButtonFullWidth,
        SavedBillsComponent,
        ButtonComponent,
    ],
    templateUrl: './billing.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [MessageService],
})
export default class BillingComponent implements AfterViewChecked, OnDestroy {
    #fb = inject(FormBuilder);
    #billingService = inject(BillingService);
    #messageService = inject(MessageService);
    billingForm = this.#fb.group({
        discount: this.#fb.control('0.2', [Validators.required]),
        company: this.#fb.control('', [Validators.required]),
        category: this.#fb.control('', [Validators.required]),
        name: this.#fb.control('NA'),
        number: this.#fb.control(''),
        MRP: this.#fb.control(null, [Validators.required]),
        quantity: this.#fb.control(null, [Validators.required]),
    });
    addComments = this.#fb.group({
        comment: this.#fb.control('', [Validators.required, minLengthAfterTrim(5)]),
    });
    visible = false;
    saveBillComments = false;
    validCommentForm = signal<boolean>(false);
    discountDropDownOptions = signal<DiscountDropdownInterface[]>(discountDropDownOptions);
    companyDropdown = signal<DropdownInterface[]>(companyDropdown);
    categoryDropdown = signal<DropdownInterface[]>(categoryDropdown);
    showItems = signal<boolean>(false);
    slNo = signal<number>(0);
    items = signal<ItemsInterface[]>([]);
    totalCost = signal<number>(0);
    showTotal = signal<boolean>(false);
    divEl = viewChild<ElementRef>('scroll');
    comparisonDiv = viewChild<ElementRef>('comparison');
    shouldScroll = signal<boolean>(false);
    scrollToCompare = signal<boolean>(false);
    selectAtLeastOneitem = signal<boolean>(false);
    otherAmt = signal<number>(0);
    allDiscounts = computed(() => {
        return this.discountDropDownOptions().map((opt) => opt.discount);
    });
    billId = '';
    billComparison = signal<BillComparisonInterface[]>([]);
    showSavedBills = signal<boolean>(false);
    showComparisons = signal<boolean>(false);
    unsubscribe$ = new Subject<void>();

    ngAfterViewChecked(): void {
        if (this.shouldScroll() && this.divEl()) {
            this.divEl()?.nativeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
            this.shouldScroll.set(false);
        }
        if (this.scrollToCompare() && this.comparisonDiv()) {
            this.comparisonDiv()?.nativeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
            this.scrollToCompare.set(false);
        }
    }

    addItem(): void {
        if (this.billingForm.valid) {
            this.showTotal.set(false);
            this.slNo.update((num) => num + 1);
            const obtainedDiscount = Number(this.billingForm.controls.discount.getRawValue()) ?? 0;
            const actualDiscount = 100 - obtainedDiscount * 100;
            const newItem: ItemsInterface = this.#billingService.addNewItemToBill(
                this.slNo(),
                this.billingForm.controls.company.getRawValue(),
                this.billingForm.controls.category.getRawValue(),
                this.billingForm.controls.MRP.getRawValue(),
                this.billingForm.controls.quantity.getRawValue(),
                actualDiscount,
                obtainedDiscount,
            );
            this.items.update((currentItems) => [...currentItems, newItem]);
            if (!this.showItems()) {
                this.showItems.set(true);
            }
            this.#messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Item added successfully',
                key: 'tc',
                life: 3000,
            });
            this.calculateTotal();
        } else {
            this.billingForm.markAllAsTouched();
        }
    }

    calculateTotal(): void {
        const rawSum = this.items().reduce((sum, item) => sum + item.subTotal, 0);
        this.totalCost.set(this.#billingService.roundToTwo(rawSum));
        // const discount = Number(this.billingForm.controls.discount.getRawValue()) ?? 0.2;
        // this.finalizedBill(discount);
        if (!this.showTotal()) {
            this.showTotal.set(true);
        }
        /*if (this.items().length > 0) {
            this.selectAtLeastOneitem.set(false);
            if (!this.showTotal()) {
                this.showTotal.set(true);
            } else {
            }
            this.shouldScroll.set(true);
        } else {
            this.selectAtLeastOneitem.set(true);
            this.totalCost.set(0);
            this.showTotal.set(false);
        }*/
    }

    scroll(): void {
        if (this.items().length > 0) {
            this.selectAtLeastOneitem.set(false);
            this.shouldScroll.set(true);
        } else {
            this.selectAtLeastOneitem.set(true);
        }
    }

    newBill(): void {
        this.billingForm.setValue({
            discount: '0.2',
            company: '',
            category: '',
            name: 'NA',
            number: '',
            MRP: null,
            quantity: null,
        });
        this.showItems.set(false);
        this.showTotal.set(false);
        this.items.set([]);
        this.otherAmt.set(0);
        this.slNo.set(0);
        this.shouldScroll.set(false);
        this.billComparison.set([]);
        this.showComparisons.set(false);
        this.totalCost.set(0);
        this.billingForm.markAsUntouched();
    }

    private percentToDecimal(percentStr: string): number {
        const num = parseFloat(percentStr.replace('%', '').trim());
        return isNaN(num) ? 0 : 1 - num / 100;
    }

    onEdited(updatedItem: ItemsInterface) {
        updatedItem.subTotal = this.#billingService.subTotalCalculation(
            updatedItem.item.startsWith('Standard:') ? 'Standard' : updatedItem.item,
            this.percentToDecimal(updatedItem.discount),
            updatedItem.quantity,
            updatedItem.mrpOrNet,
        );
        this.items.update((currentItems) =>
            currentItems.map((item) => (item.slNo === updatedItem.slNo ? updatedItem : item)),
        );
        this.billComparison.set([]);
        this.showComparisons.set(false);
        this.calculateTotal();
    }

    deleteItem(index: number): void {
        const actualIndex = index - 1;
        this.items.update((current) => {
            const next = current.filter((_, i) => i !== actualIndex);
            return next.map((it, i) => ({
                ...it,
                slNo: i + 1,
            }));
        });
        this.slNo.update((current) => current - 1);
        this.billComparison.set([]);
        this.showComparisons.set(false);
        this.calculateTotal();
    }

    generateBill(): void {
        const customerName = this.billingForm.controls.name.getRawValue() ?? '';
        const mobileControl = this.billingForm.get('number');
        const discountControl = this.billingForm.get('discount');
        const mobileNumber = (mobileControl?.value ?? '').toString().trim();
        const usedDiscount = (discountControl?.value ?? '').toString().trim();
        if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
            this.#messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'The customer mobile number is to be entered',
                key: 'tc',
                life: 3000,
            });
            return;
        }
        const requestBody: BillDetailsInterface = {
            user: customerName,
            mobile: mobileNumber,
            grandTotal: this.totalCost(),
            billItems: this.items(),
            discount: usedDiscount,
            finalizedAmt: this.otherAmt(),
        };
        this.#billingService
            .generateBill(requestBody)
            .pipe(
                tap(() => (this.visible = true)),
                takeUntil(this.unsubscribe$),
            )
            .subscribe({
                next: (res: BillResponseInterface) => {
                    this.visible = false;
                    const blobUrl = window.URL.createObjectURL(res.file);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = res.filename;
                    a.click();
                    window.URL.revokeObjectURL(blobUrl);
                    const whatsappTab =
                        'https://wa.me/91' + (this.billingForm.controls.number.getRawValue() ?? '');
                    window.open(whatsappTab, '_blank');
                },
                error: () => {
                    this.visible = false;
                    this.#messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Unable to process the request',
                        key: 'tc',
                        life: 3000,
                    });
                },
            });
    }

    previewBill(): void {}

    comparePrices(): void {
        const discountRates = this.allDiscounts();
        const comparisons = discountRates.map((rate) =>
            this.#billingService.billComparison(this.items(), rate),
        );
        this.billComparison.set(comparisons);
        this.showComparisons.set(true);
        this.scrollToCompare.set(true);
    }

    finalizedBill(discount: number): void {
        const allItems = this.#billingService.finalizedBill(this.items(), discount);
        this.items.set(allItems);
        this.billComparison.set([]);
        this.showComparisons.set(false);
        this.totalCost.set(
            this.items().reduce((sum, item) => sum + Math.floor(item.subTotal || 0), 0),
        );
    }

    otherFinalized(amt: number): void {
        this.showComparisons.set(false);
        this.otherAmt.set(amt);
    }

    saveBill(): void {
        if (this.addComments.valid) {
            this.saveBillComments = false;
            this.validCommentForm.set(false);
            const mobileControl = this.billingForm.get('number');
            const discountControl = this.billingForm.get('discount');
            const customerName = this.billingForm.controls.name.getRawValue() ?? '';
            const commentControl = this.addComments.get('comment');

            const mobileNumber = (mobileControl?.value ?? '').toString().trim();
            const usedDiscount = (discountControl?.value ?? '').toString().trim();
            const comment = (commentControl?.value ?? '').toString().trim();

            const requestBody: TempBillDetailsInterface = {
                user: customerName,
                mobile: mobileNumber,
                grandTotal: this.totalCost(),
                finalizedAmt: this.otherAmt(),
                comments: comment,
                discount: usedDiscount,
                tempBillItems: this.items().map((item) => ({
                    mrpOrNet: item.mrpOrNet,
                    item: item.item,
                    quantity: item.quantity,
                    discount: item.discount,
                    subTotal: item.subTotal,
                })),
            };

            this.#billingService
                .saveTempBill(requestBody)
                .pipe(
                    tap(() => (this.visible = true)),
                    takeUntil(this.unsubscribe$),
                )
                .subscribe({
                    next: (res: BillResponseInterface) => {
                        this.visible = false;
                        this.#billingService.savedBillsResource.reload();
                        this.addComments.reset();
                        this.addComments.markAsUntouched();
                        this.addComments.markAsPristine();
                        this.#messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Bill saved for later',
                            key: 'tc',
                            life: 3000,
                        });
                        //const number = this.billingForm.controls.number.getRawValue()?.trim();
                        this.newBill();
                        //if (number) {
                            const blobUrl = window.URL.createObjectURL(res.file);
                            const a = document.createElement('a');
                            a.href = blobUrl;
                            a.download = res.filename;
                            a.click();
                            window.URL.revokeObjectURL(blobUrl);
                            //const whatsappTab = 'https://wa.me/91' + number;
                            //window.open(whatsappTab, '_blank');
                        //}
                    },
                    error: (err) => {
                        this.visible = false;
                        this.#messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail:
                                err.error?.message ??
                                err.statusText ??
                                'Failed to save temporary bill',
                            key: 'tc',
                            life: 3000,
                        });
                    },
                });
        } else {
            this.#messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Add comment to save bill',
                key: 'tc',
                life: 3000,
            });
        }
    }

    import(eid: number): void {
        this.showSavedBills.set(false);
        this.#billingService
            .getSavedBill(eid)
            .pipe(
                tap(() => (this.visible = true)),
                takeUntil(this.unsubscribe$),
            )
            .subscribe({
                next: (res: SavedTempBillResponseInterface) => {
                    this.visible = false;
                    this.#billingService.savedBillsResource.reload();
                    // Update only the relevant reactive form controls.
                    this.billingForm.patchValue({
                        number: res.mobile,
                        name: res.user,
                    });

                    // Clear existing items before importing the saved ones.
                    this.items.set([]);

                    // Map the saved items to the existing ItemsInterface.
                    this.items.set(
                        res.items.map((item, index) => ({
                            slNo: index + 1,
                            item: item.item,
                            mrpOrNet: item.mrpOrNet,
                            quantity: item.quantity,
                            discount: item.discount,
                            subTotal: item.subTotal,
                        })),
                    );

                    this.showItems.set(true);
                    this.calculateTotal();

                    this.#messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Saved bill imported successfully',
                        key: 'tc',
                        life: 3000,
                    });
                },
                error: (err) => {
                    this.visible = false;
                    this.#messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            err.error?.message ?? err.statusText ?? 'Failed to import saved bill',
                        key: 'tc',
                        life: 3000,
                    });
                },
            });
    }

    delete(eid: number): void {
        this.showSavedBills.set(false);
        this.#billingService
            .deleteSavedBill(eid)
            .pipe(
                tap(() => (this.visible = true)),
                takeUntil(this.unsubscribe$),
            )
            .subscribe({
                next: () => {
                    this.visible = false;
                    this.#billingService.savedBillsResource.reload();
                    this.#messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Saved bill deleted successfully',
                        key: 'tc',
                        life: 3000,
                    });
                },
                error: (err) => {
                    this.visible = false;
                    this.#messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail:
                            err.error?.message ?? err.statusText ?? 'Failed to delete saved bill',
                        key: 'tc',
                        life: 3000,
                    });
                },
            });
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
