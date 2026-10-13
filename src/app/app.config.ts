import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';

import Nora from '@primeuix/themes/nora';
import { providePrimeNG } from 'primeng/config';

import { MessageService } from 'primeng/api';
import { PRIMEUI_LICENSE } from '../environments/primeui-license';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { errorInterceptor } from './core/interceptors/errors-interceptor';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),

    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({ skipInitialTransition: true }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),

    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor])),

    provideClientHydration(),
    MessageService,

    providePrimeNG({
      // من PRIMEUI_LICENSE وقت البناء (scripts/write-primeui-license.mjs) — بدونه يظهر شريط الترخيص
      license: PRIMEUI_LICENSE || undefined,
      theme: {
        preset: Nora,
        options: {
          darkModeSelector: '.my-app-dark',

          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng, utilities',
          },
        },
      },
    }),
  ],
};
