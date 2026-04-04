import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { HeaderRouterInterface } from '../interfaces/header-router.interface';
import { LoginInterface, LoginRequestBody } from '../interfaces/login.interface';

@Injectable({
    providedIn: 'root',
})
export class LoginService {
    #http = inject(HttpClient);
    #router = inject(Router);
    url = environment.baseUrl;
    allRoutes = signal<HeaderRouterInterface[]>([]);
    isLoggingOut = signal<boolean>(false);

    public login(req: LoginRequestBody): Observable<LoginInterface> {
        const loginUrl = this.url + 'login/user';
        return this.#http.post<LoginInterface>(loginUrl, req);
    }

    public logout(): void {
        localStorage.clear();
        this.allRoutes.set([]);
        this.#router.navigateByUrl('/');
    }
}
