import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { BillingService } from '../../../services/billing.service';
import { GetAllSavedBills } from '../../../interfaces/temp.interface';
import { SpinnerComponent } from '../../../components/spinner.component';
import { ButtonComponent } from '../../inventory/components/button.component';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-saved-bills',
    imports: [SpinnerComponent, ButtonComponent, TableModule],
    template: `
        <div class="page-shell">
            <div class="page-container page-stack">
                <header class="page-header">
                    <h1 class="page-title">Saved Bills</h1>
                    <p class="page-subtitle">Record and review saved bills</p>
                </header>

                <div class="content-card">
                    <app-button
                        variant="accent"
                        [width]="'w-80 md:w-auto'"
                        (buttonClicked)="backClicked.emit()"
                        >Go Back</app-button
                    >
                    <div class="card-body mt-4">
                        @if (!loadingData()) {
                            <div class="hidden md:block">
                                <p-table
                                    [value]="allSavedBills()"
                                    dataKey="ID"
                                    styleClass="p-datatable-sm"
                                >
                                    <ng-template #header>
                                        <tr>
                                            <th>Sl. No</th>
                                            <th>Comments</th>
                                            <th>Amount</th>
                                            <th></th>
                                        </tr>
                                    </ng-template>
                                    <ng-template #body let-item let-rowIndex="rowIndex">
                                        <tr>
                                            <td>{{ rowIndex + 1 }}</td>
                                            <td>{{ item.comments }}</td>
                                            <td>₹{{ item.finalizedAmt }}</td>
                                            <td class="flex gap-4">
                                                <app-button
                                                    variant="accent"
                                                    (buttonClicked)="delete(item.id)"
                                                    >Delete</app-button
                                                >
                                                <app-button
                                                    variant="secondary"
                                                    (buttonClicked)="import(item.id)"
                                                >
                                                    Import
                                                </app-button>
                                            </td>
                                        </tr>
                                    </ng-template>
                                </p-table>
                            </div>
                            <div class="data-stack md:hidden">
                                @for (item of allSavedBills(); track item.id; let i = $index) {
                                    <div class="data-card">
                                        <div class="data-card-header">Saved Bill #{{ i + 1 }}</div>
                                        <div class="data-row">
                                            <span class="data-row-label">Comments</span>
                                            <span class="data-row-value">{{ item.comments }}</span>
                                        </div>
                                        <div class="data-row">
                                            <span class="data-row-label">Amount</span>
                                            <span class="data-row-value"
                                                >₹{{ item.finalizedAmt }}</span
                                            >
                                        </div>
                                        <div class="section-actions">
                                            <div class="w-full">
                                                <div
                                                    class="section-actions--items section-actions--between"
                                                >
                                                    <app-button
                                                        variant="accent"
                                                        (buttonClicked)="delete(item.id)"
                                                        >Delete</app-button
                                                    >
                                                    <app-button
                                                        variant="secondary"
                                                        (buttonClicked)="import(item.id)"
                                                    >
                                                        Import
                                                    </app-button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        } @else {
                            <app-spinner class="flex items-center justify-center py-12" />
                        }

                        @if (allSavedBills().length === 0 && !loadingData()) {
                            <p class="empty-state">No record yet</p>
                        }
                    </div>
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class SavedBillsComponent {
    #billingService = inject(BillingService);
    allSavedBills = computed<GetAllSavedBills[]>(() => {
        const resource = this.#billingService.savedBillsResource;
        return resource.hasValue() ? resource.value() : [];
    });
    loadingData = computed(() => this.#billingService.savedBillsResource.isLoading());
    backClicked = output<void>();
    deleteClicked = output<number>();
    importClicked = output<number>();

    delete(id: number): void {
        this.deleteClicked.emit(id);
    }

    import(id: number): void {
        this.importClicked.emit(id);
    }
}
