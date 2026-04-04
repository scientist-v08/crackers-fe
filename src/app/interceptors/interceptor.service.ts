import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoginService } from '../services/login.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const authToken = localStorage.getItem('token');
    const loginService = inject(LoginService);

    let authReq = req;

    if (authToken) {
        authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${authToken}` },
        });
    }

    return next(authReq).pipe(
        catchError((err: HttpErrorResponse) => {
            if (err.status === 401 && !loginService.isLoggingOut()) {
                loginService.isLoggingOut.set(true);
                loginService.logout();
            }
            return throwError(() => err);
        }),
    );
};
