import { inject, Injectable, signal } from '@angular/core';
import { InventoryState, InventoryStateOrdered } from '../constants/inventory.constants';
import { Observable } from 'rxjs';
import {
    InventoryItem,
    InventoryResponseInterface,
    NewInventoryItem,
} from '../interfaces/inventory.interface';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { SuccessInterface, UpdateInventorySuccessInterface } from '../interfaces/success.interface';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class InventoryService {
    #Url = environment.baseUrl;
    state = signal<InventoryState>(InventoryStateOrdered);
    stateObservable$ = toObservable(this.state);
    #http = inject(HttpClient);

    getAllInventoryItems(
        pageNumber: number,
        pageSize: number,
        title: string,
        state: string,
    ): Observable<InventoryResponseInterface> {
        const url =
            this.#Url +
            `admin/inventory?pageNumber=${pageNumber}&pageSize=${pageSize}&sortBy=id&order=desc&title=${title}&state=${state}`;
        return this.#http.get<InventoryResponseInterface>(url);
    }

    addNewItemToInventory(reqBody: NewInventoryItem): Observable<SuccessInterface> {
        const url = this.#Url + 'admin/inventory';
        return this.#http.post<SuccessInterface>(url, reqBody);
    }

    updateInventoryItem(req: InventoryItem): Observable<UpdateInventorySuccessInterface> {
        const updatesReqBody = {
            id: req.id,
            brandOrCompany: req.brandOrCompany,
            item: req.item,
            numOfBoxes: req.numOfBoxes,
            numOfCartons: req.numOfCartons,
            pricePerCarton: req.pricePerCarton,
            state: req.state,
        };
        const url = this.#Url + 'admin/updateInventory';
        return this.#http.post<UpdateInventorySuccessInterface>(url, updatesReqBody);
    }
}
