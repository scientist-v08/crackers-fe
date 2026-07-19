import { Component, computed, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PriceListTableComponent } from './components/priceListTable.component';
import { SpinnerComponent } from '../../components/spinner.component';
import { Toast } from 'primeng/toast';
import { PriceListInterface } from '../../interfaces/priceList.interface';
import { PriceListService } from '../../services/priceList.service';

@Component({
    selector: 'app-price-list',
    templateUrl: './priceList.component.html',
    imports: [PriceListTableComponent, SpinnerComponent],
    providers: [],
})
export default class PriceListComponent {
    #priceListService = inject(PriceListService);
    allPrices = computed<PriceListInterface[]>(() => {
        const resource = this.#priceListService.priceListResource;
        return resource.hasValue() ? resource.value() : [];
    });
    loadingData = computed(() => this.#priceListService.priceListResource.isLoading());
}
