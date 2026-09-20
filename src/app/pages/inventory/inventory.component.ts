import { Component, computed, inject, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { InventoryService } from '../../services/inventory.service';
import {
    InventoryState,
    InventoryStateOrdered,
    InventoryStateReceived,
    InventoryStateUnpacked,
} from '../../constants/inventory.constants';
import { ItemsComponent } from './components/items.component';
import { Store } from '@ngrx/store';
import { InventoryActions } from '../../store/inventory.actions';
import * as InventorySelectors from '../../store/inventory.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [TabsModule, ItemsComponent],
    templateUrl: './inventory.component.html',
})
export default class InventoryComponent {
    #store = inject(Store);

    ordered = InventoryStateOrdered;
    received = InventoryStateReceived;
    unpacked = InventoryStateUnpacked;

    selectedTab = toSignal(this.#store.select(InventorySelectors.selectSelectedTab), {
        initialValue: InventoryStateOrdered,
    });

    totalGoodsValue = toSignal(this.#store.select(InventorySelectors.selectTotal), {
        initialValue: 0,
    });

    goodsValueDivision = computed(() => {
        switch (this.selectedTab()) {
            case this.ordered:
                return 'ordered';
            case this.received:
                return 'received';
            case this.unpacked:
                return 'unpacked';
            default:
                return '';
        }
    });

    activeTab = computed(() => {
        switch (this.selectedTab()) {
            case this.ordered:
                return '0';
            case this.received:
                return '1';
            case this.unpacked:
                return '2';
            default:
                return '0';
        }
    });

    tabClicked(item: InventoryState): void {
        this.#store.dispatch(InventoryActions.setTab({ tab: item }));
    }
}
