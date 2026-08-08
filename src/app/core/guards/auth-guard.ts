import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth/auth';

/**
 * Blocks any route that requires a logged-in user, redirecting anonymous
 * visitors to /login. Logged-in users pass through normally.
 */
export const authGuard: CanActivateFn = (route, state) => {
  // الـ SSR معندوش وصول لـ localStorage، فأي قرار هنا هيبقى مبني على معلومة غلط
  // (currentUser بيبقى null دايمًا في السيرفر بغض النظر عن الحالة الحقيقية) —
  // القرار الحقيقي بيتساب للكلاينت بس، اللي بيعيد تقييم الـ guard تلقائيًا أول ما
  // الأبليكيشن يعمل hydrate بمعلومة auth صحيحة
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
