import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { AuthInterceptor } from './interceptors/interceptor.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideClientHydration(),
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideRouter(appRoutes),
        providePrimeNG({
            theme: {
                preset: Aura,
            },
        }),
    ],
};
