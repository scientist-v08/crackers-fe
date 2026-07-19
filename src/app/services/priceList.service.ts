import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { PriceListInterface } from '../interfaces/priceList.interface';

@Injectable({ providedIn: 'root' })
export class PriceListService {
    url = environment.baseUrl;

    readonly priceListResource = httpResource<PriceListInterface[]>(
        () => ({
            url: `${this.url}all/price-list`,
            method: 'GET',
        }),
        {
            defaultValue: [] as PriceListInterface[],
        },
    );
}
