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

@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [TabsModule, ItemsComponent],
    templateUrl: './inventory.component.html',
})
export default class InventoryComponent {
    #inventoryService = inject(InventoryService);
    totalGoodsValue = signal<number>(0);
    goodsValueDivision = signal<string>('');
    ordered = InventoryStateOrdered;
    received = InventoryStateReceived;
    unpacked = InventoryStateUnpacked;
    serviceState = this.#inventoryService.state;

    activeTab = computed(() => {
        switch (this.serviceState()) {
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
        this.#inventoryService.state.set(item);
    }

    totalObtained(val: number, division: string): void {
        this.totalGoodsValue.set(val);
        this.goodsValueDivision.set(division);
    }
}
