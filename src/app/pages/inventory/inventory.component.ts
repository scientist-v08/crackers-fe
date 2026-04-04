import { Component, inject } from '@angular/core';
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
  ordered = InventoryStateOrdered;
  received = InventoryStateReceived;
  unpacked = InventoryStateUnpacked;
  serviceState = this.#inventoryService.state;

  tabClicked(item: InventoryState): void {
    this.#inventoryService.state.set(item);
  }
}
