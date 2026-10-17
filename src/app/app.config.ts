import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { AuthInterceptor } from './interceptors/interceptor.service';
import { provideState, provideStore } from '@ngrx/store';
import { inventoryFeature } from './store/inventory.reducer';
import { crackersPreset } from './prime-ng.preset';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withXhr(), withInterceptors([AuthInterceptor])),
        provideRouter(appRoutes),
        provideStore(),
        provideState(inventoryFeature),
        providePrimeNG({
            theme: {
                preset: crackersPreset,
                options: {
                    cssLayer: false,
                    darkModeSelector: false,
                },
            },
        }),
    ],
};
