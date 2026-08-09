import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth/auth';
import { LanguageService } from '../services/language/language';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);
  const languageService = inject(LanguageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        messageService.add({
          severity: 'warn',
          summary: languageService.translate('errors.sessionExpiredTitle'),
          detail: languageService.translate('errors.sessionExpiredDetail'),
        });

        const currentUrl = router.url;
        if (currentUrl && currentUrl !== '/login') {
          router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
        } else {
          router.navigateByUrl('/login');
        }
      } else if (error.status === 403) {
        messageService.add({
          severity: 'error',
          summary: languageService.translate('errors.accessDeniedTitle'),
          detail: languageService.translate('errors.accessDeniedDetail'),
        });
      } else if (error.status === 0) {
        messageService.add({
          severity: 'error',
          summary: languageService.translate('errors.connectionErrorTitle'),
          detail: languageService.translate('errors.connectionErrorDetail'),
        });
      } else if (error.status >= 500) {
        messageService.add({
          severity: 'error',
          summary: languageService.translate('errors.serverErrorTitle'),
          detail: languageService.translate('errors.serverErrorDetail'),
        });
      }
      // باقي الحالات (400/404/409/422...) بتتمرر عادي من غير toast —
      // دي أخطاء خاصة بفورم/طلب معين، والكومبوننت اللي طلبها هو اللي يعرضها بالسياق المناسب.

      return throwError(() => error);
    }),
  );
};
