import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth/auth';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        messageService.add({
          severity: 'warn',
          summary: 'Session expired',
          detail: 'Please sign in again to continue.',
        });
        router.navigateByUrl('/login');
      } else if (error.status === 403) {
        messageService.add({
          severity: 'error',
          summary: 'Access denied',
          detail: 'You do not have permission to perform this action.',
        });
      } else if (error.status === 0) {
        messageService.add({
          severity: 'error',
          summary: 'Connection error',
          detail: 'Could not reach the server. Check your connection and try again.',
        });
      } else if (error.status >= 500) {
        messageService.add({
          severity: 'error',
          summary: 'Server error',
          detail: 'Something went wrong on our end. Please try again shortly.',
        });
      }
      // باقي الحالات (400/404/409/422...) بتتمرر عادي من غير toast —
      // دي أخطاء خاصة بفورم/طلب معين، والكومبوننت اللي طلبها هو اللي يعرضها بالسياق المناسب.

      return throwError(() => error);
    }),
  );
};
