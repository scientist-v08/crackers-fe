import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { AuthInterceptor } from './interceptors/interceptor.service';
import { provideState, provideStore } from '@ngrx/store';
import { inventoryFeature } from './store/inventory.reducer';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideRouter(appRoutes),
        provideStore(),
        provideState(inventoryFeature),
        providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    cssLayer: false,
                    darkModeSelector: false,
                },
            },
        }),
    ],
};
