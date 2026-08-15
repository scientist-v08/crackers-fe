import { Injectable } from '@angular/core';
import { ProductList } from '../interfaces/priceList.interface';
import { environment } from '../../environments/environment.development';
import { httpResource } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PriceListService {
    url = environment.baseUrl;

    readonly priceListResource = httpResource<ProductList>(
        () => ({
            url: `${this.url}get/price-list`,
            method: 'GET',
        }),
        {
            defaultValue: [] as ProductList,
        },
    );
}
