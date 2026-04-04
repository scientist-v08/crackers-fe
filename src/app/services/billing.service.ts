import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import {
  BillDetailsInterface,
  BillResponseInterface,
} from '../interfaces/billDetails.interface';
import { map, Observable } from 'rxjs';
import { ItemsInterface } from '../interfaces/items.interface';
import { BillComparisonInterface } from '../interfaces/billComparison.interface';

@Injectable({ providedIn: 'root' })
export class BillingService {
  #http = inject(HttpClient);
  url = environment.baseUrl;

  public generateBill(
    req: BillDetailsInterface
  ): Observable<BillResponseInterface> {
    const billUrl = this.url + 'billing';
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
        })
      );
  }

  public generatePreviewBill(
    req: BillDetailsInterface
  ): Observable<BillResponseInterface> {
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
        })
      );
  }

  public billComparison(
    allItems: ItemsInterface[],
    percent: number
  ): BillComparisonInterface {
    const discount = `${100 - percent * 100}% off`;
    const total = allItems.reduce((total: number, item: ItemsInterface) => {
      const baseAmount = item.mrpOrNet * item.quantity;
      if (item.item.startsWith('Standard:')) {
        return total + Math.floor(baseAmount * percent);
      } else {
        return total + baseAmount;
      }
    }, 0);
    return {
      discount: discount,
      total: total,
    };
  }

  public finalizedBill(
    allItems: ItemsInterface[],
    discount: number
  ): ItemsInterface[] {
    return allItems.map((item: ItemsInterface) => {
      const changedDiscount = `${100 - discount * 100}%`;
      const baseAmount = item.mrpOrNet * item.quantity;
      if (item.item.startsWith('Standard:')) {
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
    obtainedDiscount: number
  ): ItemsInterface {
    return {
      slNo: slNo,
      item: `${company}: ${category}`,
      mrpOrNet: MRP ?? 0,
      quantity: quantity ?? 0,
      discount: company === 'Standard' ? `${discount}%` : 'NA',
      subTotal: this.subTotalCalculation(
        company,
        obtainedDiscount,
        quantity,
        MRP
      ),
    };
  }

  public subTotalCalculation(
    company: string | null,
    discount: number,
    quantity: number | null,
    mrpOrNet: number | null
  ): number {
    if (company) {
      if (company === 'Standard') {
        const subtotal = Math.floor(
          (mrpOrNet as number) * (quantity as number) * discount
        );
        return subtotal ?? 0;
      } else {
        const subtotal = (mrpOrNet as number) * (quantity as number);
        return subtotal ?? 0;
      }
    }
    return 0;
  }
}
