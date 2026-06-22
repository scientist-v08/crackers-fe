import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderRouterInterface } from '../../interfaces/header-router.interface';
import {
    LoginInterface,
    LoginRequestBody,
    LoginRouteInterface,
    Route,
} from '../../interfaces/login.interface';
import { LoginService } from '../../services/login.service';

@Component({
    standalone: true,
    imports: [ReactiveFormsModule],
    selector: 'app-login',
    template: `
        <div class="login-shell">
            <div class="login-card">
                <h1 class="login-brand">Vinayaka Crackers</h1>
                <p class="login-tagline">Sign in to manage billing, inventory, and expenses</p>

                <form
                    class="login-form"
                    [formGroup]="loginForm"
                    (ngSubmit)="loginSubmission()"
                >
                    <div class="form-field">
                        <label class="form-label form-label-required" for="username">
                            Username
                        </label>
                        <input
                            class="form-control"
                            id="username"
                            type="text"
                            formControlName="username"
                            placeholder="Enter your username"
                        />
                        <div class="form-message">
                            @if (
                                loginForm.get('username')?.touched &&
                                loginForm.get('username')?.hasError('required')
                            ) {
                                <p class="form-error">Username is required</p>
                            }
                        </div>
                    </div>

                    <div class="form-field">
                        <label class="form-label form-label-required" for="password">
                            Password
                        </label>
                        <div class="form-control-row">
                            <input
                                class="form-control"
                                id="password"
                                [type]="passwordType()"
                                formControlName="password"
                                placeholder="Enter your password"
                            />
                            <button
                                class="btn btn-secondary"
                                (click)="togglePasswordVisibility()"
                                type="button"
                            >
                                {{ passwordType() === 'password' ? 'Show' : 'Hide' }}
                            </button>
                        </div>
                        <div class="form-message">
                            @if (loginForm.get('password')?.touched) {
                                @if (loginForm.get('password')?.hasError('required')) {
                                    <p class="form-error">Password is required</p>
                                } @else if (loginForm.get('password')?.hasError('pattern')) {
                                    <div class="form-error-box">
                                        Password must have 1 capital letter, 1 small letter, 1
                                        number, 1 special character and be at least 8 characters
                                        long.
                                    </div>
                                }
                            }
                        </div>
                        @if (incorrectPassword()) {
                            <div class="form-error-box text-center">
                                Incorrect password. Login failed.
                            </div>
                        }
                    </div>

                    <button class="btn btn-primary w-full" type="submit">Login</button>
                </form>
            </div>
        </div>
    `,
    styles: [],
    host: {
        class: 'block h-full',
    },
})
export default class LoginComponent implements OnDestroy {
    #fb = inject(FormBuilder);
    #loginService = inject(LoginService);
    #router = inject(Router);
    passwordType = signal<'password' | 'text'>('password');
    loginForm = this.#fb.group({
        username: this.#fb.control('', Validators.required),
        password: this.#fb.control('', [Validators.required]),
    });
    subscription = new Subscription();
    incorrectPassword = signal<boolean>(false);

    togglePasswordVisibility() {
        this.passwordType.update((type) => (type === 'password' ? 'text' : 'password'));
    }

    loginSubmission(): void {
        if (this.loginForm.valid) {
            const reqBody: LoginRequestBody = {
                Email: this.loginForm.get('username')?.getRawValue(),
                Password: this.loginForm.get('password')?.getRawValue(),
            };
            this.subscription = this.#loginService.login(reqBody).subscribe({
                next: (res: LoginInterface) => {
                    localStorage.setItem('token', res.access_token);
                    const routes = res.routes || [];
                    // Determine if user is ADMIN
                    const isAdmin =
                        routes.length > 0 &&
                        // New format (number)
                        ((routes[0] as Route).role === 2 ||
                            // Old format (string)
                            (routes[0] as LoginRouteInterface).Role === 'ROLE_ADMIN');

                    if (isAdmin) {
                        localStorage.setItem('admin', 'true');
                        localStorage.removeItem('user');
                    } else {
                        localStorage.setItem('user', 'true');
                        localStorage.removeItem('admin');
                    }

                    // Map routes to HeaderRouterInterface - handle both formats
                    const headerRoutes: HeaderRouterInterface[] = routes.map((item) => {
                        const routeItem = item as any;

                        return {
                            id: routeItem.id ?? routeItem.Id,
                            route: routeItem.route ?? routeItem.Route,
                            heading: routeItem.heading ?? routeItem.Heading,
                        };
                    });
                    localStorage.setItem('routes', JSON.stringify(headerRoutes));
                    this.#router.navigateByUrl(headerRoutes[0].route);
                    this.#loginService.allRoutes.set(headerRoutes);
                    this.#loginService.isLoggingOut.set(false);
                },
                error: (err: HttpErrorResponse) => {
                    this.incorrectPassword.set(true);
                    console.log(err.message);
                },
            });
        } else {
            this.loginForm.markAllAsTouched();
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
