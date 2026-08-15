import { Component, computed, inject } from '@angular/core';
import { SpinnerComponent } from '../../components/spinner.component';
import { PriceListTableComponent } from './components/priceListTable.component';
import { PriceListService } from '../../services/priceList.service';
import { ProductList } from '../../interfaces/priceList.interface';
import { TabsModule } from 'primeng/tabs';

@Component({
    selector: 'app-price-list',
    templateUrl: './priceList.component.html',
    imports: [PriceListTableComponent, SpinnerComponent, TabsModule],
    providers: [],
})
export default class PriceListComponent {
    #priceListService = inject(PriceListService);
    allPrices = computed<ProductList>(() => {
        const resource = this.#priceListService.priceListResource;
        return resource.hasValue() ? resource.value() : [];
    });
    loadingData = computed(() => this.#priceListService.priceListResource.isLoading());
}
