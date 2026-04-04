import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderRouterInterface } from '../../interfaces/header-router.interface';
import { LoginInterface, LoginRequestBody } from '../../interfaces/login.interface';
import { LoginService } from '../../services/login.service';

@Component({
    standalone: true,
    imports: [ReactiveFormsModule],
    selector: 'app-login',
    template: `
        <div
            class="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-black p-4"
        >
            <div class="w-full max-w-md">
                <!-- Main Login Card -->
                <div
                    class="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300"
                >
                    <div class="p-8 sm:p-10">
                        <div class="text-center mb-10">
                            <h1
                                class="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight"
                            >
                                Login
                            </h1>
                            <p class="mt-2 text-gray-500 dark:text-gray-400">
                                Sign in to your account
                            </p>
                        </div>

                        <form
                            class="space-y-6"
                            [formGroup]="loginForm"
                            (ngSubmit)="loginSubmission()"
                        >
                            <!-- Username Field -->
                            <div>
                                <label
                                    class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1"
                                    for="username"
                                >
                                    Username
                                </label>
                                <div class="relative group">
                                    <input
                                        class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all duration-200"
                                        id="username"
                                        type="text"
                                        formControlName="username"
                                        placeholder="Enter your username"
                                    />
                                </div>
                                @if (
                                    loginForm.get('username')?.touched &&
                                    loginForm.get('username')?.hasError('required')
                                ) {
                                    <p
                                        class="mt-2 text-xs font-medium text-red-500 flex items-center animate-pulse"
                                    >
                                        <span class="mr-1">⚠️</span>
                                        User is required
                                    </p>
                                }
                            </div>

                            <!-- Password Field -->
                            <div>
                                <label
                                    class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1"
                                    for="password"
                                >
                                    Password
                                </label>
                                <div class="relative group">
                                    <input
                                        class="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all duration-200 pr-12"
                                        id="password"
                                        [type]="passwordType()"
                                        formControlName="password"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-amber-500 transition-colors focus:outline-none"
                                        (click)="togglePasswordVisibility()"
                                        type="button"
                                    >
                                        @if (passwordType() === 'password') {
                                            <svg
                                                class="h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        } @else {
                                            <svg
                                                class="h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                                                />
                                            </svg>
                                        }
                                    </button>
                                </div>

                                @if (loginForm.get('password')?.touched) {
                                    @if (loginForm.get('password')?.hasError('required')) {
                                        <p
                                            class="mt-2 text-xs font-medium text-red-500 flex items-center animate-pulse"
                                        >
                                            <span class="mr-1">⚠️</span>
                                            Password is required
                                        </p>
                                    } @else if (loginForm.get('password')?.hasError('pattern')) {
                                        <div
                                            class="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30"
                                        >
                                            <p
                                                class="text-xs font-medium text-red-600 dark:text-red-400 leading-relaxed"
                                            >
                                                Password must have 1 capital letter, 1 small letter,
                                                1 number, 1 special character and be at least 8
                                                characters long.
                                            </p>
                                        </div>
                                    }
                                }

                                @if (incorrectPassword()) {
                                    <p
                                        class="mt-4 text-sm font-bold text-red-500 text-center bg-red-50 dark:bg-red-900/20 py-3 rounded-xl border border-red-100 dark:border-red-800/30 shadow-sm"
                                    >
                                        Incorrect password. Login failed.
                                    </p>
                                }
                            </div>

                            <!-- Submit Button -->
                            <div class="pt-4">
                                <button
                                    class="w-full group relative flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-2xl text-black bg-amber-300 hover:bg-amber-400 dark:text-white dark:bg-pink-600 dark:hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-amber-500/50 dark:focus:ring-pink-500/50 transition-all duration-300 shadow-lg shadow-amber-500/20 dark:shadow-pink-500/20 active:scale-[0.98]"
                                    type="submit"
                                >
                                    <span class="flex items-center">
                                        Login
                                        <svg
                                            class="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                                            />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
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
        password: this.#fb.control('', [
            Validators.required,
            Validators.pattern(
                '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
            ),
        ]),
    });
    subscription = new Subscription();
    incorrectPassword = signal<boolean>(false);

    togglePasswordVisibility() {
        this.passwordType.update(type => (type === 'password' ? 'text' : 'password'));
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
                    if (res.routes[0].Role === 'ROLE_ADMIN') {
                        localStorage.setItem('admin', 'true');
                    } else {
                        localStorage.setItem('user', 'true');
                    }
                    const headerRoutes: HeaderRouterInterface[] = res.routes.map(
                        ({ Id, Route, Heading }) => ({
                            id: Id,
                            route: Route,
                            heading: Heading,
                        }),
                    );
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
