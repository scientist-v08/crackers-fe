import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { BillDetailsInterface, BillResponseInterface } from '../interfaces/billDetails.interface';
import { map, Observable } from 'rxjs';
import { ItemsInterface } from '../interfaces/items.interface';
import { BillComparisonInterface } from '../interfaces/billComparison.interface';

@Injectable({ providedIn: 'root' })
export class BillingService {
    #http = inject(HttpClient);
    url = environment.baseUrl;

    public generateBill(req: BillDetailsInterface): Observable<BillResponseInterface> {
        const billUrl = this.url + 'all/billing/preview';
        return this.#http
            .post<Blob>(billUrl, req, {
                observe: 'response',
                responseType: 'blob' as 'json',
            })
            .pipe(
                map((res) => {
                    let filename = `bill_${Date.now()}.pdf`;
                    const contentDisposition = res.headers.get('Content-Disposition');
                    if (contentDisposition) {
                        const match = contentDisposition.match(/filename="?(.+?)"?$/i);
                        if (match?.[1]) {
                            filename = match[1];
                        }
                    }
                    return {
                        file: res.body!,
                        filename,
                    };
                }),
            );
    }

    /*public generatePreviewBill(req: BillDetailsInterface): Observable<HttpResponse<Blob>> {
        const billPreviewurl = this.url + 'billing/preview';
        return this.#http.post(billPreviewurl, req, {
            observe: 'response',
            responseType: 'blob',
        });
    }*/

    public generatePreviewBill(req: BillDetailsInterface): Observable<BillResponseInterface> {
        const billPreviewurl = this.url + 'billing/preview';
        return this.#http
            .post<Blob>(billPreviewurl, req, {
                observe: 'response',
                responseType: 'blob' as 'json',
            })
            .pipe(
                map((res) => {
                    let filename = 'bill_preview.pdf';
                    const contentDisposition = res.headers.get('Content-Disposition');
                    if (contentDisposition) {
                        const match = contentDisposition.match(/filename="?(.+?)"?$/i);
                        if (match?.[1]) {
                            filename = match[1];
                        }
                    }
                    return {
                        file: res.body!,
                        filename,
                    };
                }),
            );
    }

    public roundToTwo(num: number): number {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }

    public billComparison(allItems: ItemsInterface[], percent: number): BillComparisonInterface {
        const discount = `${100 - Math.round(percent * 100)}% off`;
        const total = allItems.reduce((acc: number, item: ItemsInterface) => {
            const isGiftBox = item.item.startsWith('Other/Gift Box:');
            const company = isGiftBox ? 'Other/Gift Box' : 'Standard';
            // Reuse the exact same subTotalCalculation method!
            const itemSubtotal = this.subTotalCalculation(
                company,
                percent,
                item.quantity,
                item.mrpOrNet,
            );
            return this.roundToTwo(acc + itemSubtotal);
        }, 0);

        return {
            discount: discount,
            total: total,
        };
    }

    public finalizedBill(allItems: ItemsInterface[], discount: number): ItemsInterface[] {
        return allItems.map((item: ItemsInterface) => {
            const changedDiscount = `${100 - discount * 100}%`;
            const baseAmount = item.mrpOrNet * item.quantity;
            if (!item.item.startsWith('Other/Gift Box:')) {
                item.discount = changedDiscount;
                item.subTotal = Math.floor(baseAmount * discount);
            }
            return item;
        });
    }

    public addNewItemToBill(
        slNo: number,
        company: string | null,
        category: string | null,
        MRP: number | null,
        quantity: number | null,
        discount: number,
        obtainedDiscount: number,
    ): ItemsInterface {
        const cleanMRP = Number(MRP) || 0;
        const cleanQty = Number(quantity) || 0;
        return {
            slNo: slNo,
            item: `${company}: ${category}`,
            mrpOrNet: cleanMRP,
            quantity: cleanQty,
            discount: company !== 'Other/Gift Box' ? `${discount}%` : 'NA',
            subTotal: this.subTotalCalculation(company, obtainedDiscount, cleanQty, cleanMRP),
        };
    }

    public subTotalCalculation(
        company: string | null,
        discount: number,
        quantity: number | null,
        mrpOrNet: number | null,
    ): number {
        if (!company || !quantity || !mrpOrNet) {
            return 0;
        }
        const rawTotal =
            company !== 'Other/Gift Box' ? mrpOrNet * quantity * discount : mrpOrNet * quantity;
        return this.roundToTwo(rawTotal);
    }
}
