import { Component, computed, input, signal } from '@angular/core';
import { List } from '../../../interfaces/priceList.interface';

@Component({
    selector: 'app-price-list-card',
    imports: [],
    template: `
        <input
            type="search"
            class="form-control"
            placeholder="Search"
            [value]="searchTerm()"
            (input)="searchTerm.set($any($event.target).value)"
        />
        @for (item of filteredList(); track item.id; let i = $index) {
            <div class="data-card">
                <div class="data-card-header">#{{ i + 1 }}</div>
                <div class="data-row">
                    <span class="data-row-label">Item</span>
                    <span class="data-row-value">{{ item.item }}</span>
                </div>
                <div class="data-row">
                    <span class="data-row-label">Price</span>
                    <span class="data-row-value">₹{{ item.price }}</span>
                </div>
            </div>
        }
    `,
    host: {
        class: 'data-stack md:hidden',
    },
})
export class PriceListcard {
    itemList = input.required<List[]>();
    searchTerm = signal('');
    filteredList = computed(() => {
        const term = this.searchTerm().toLowerCase().trim();
        if (!term) return this.itemList();

        return this.itemList().filter((item) => item.item.toLowerCase().includes(term));
    });
}
