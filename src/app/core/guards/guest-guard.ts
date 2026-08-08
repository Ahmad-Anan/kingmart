import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth/auth';

/**
 * Blocks /login and /register for users who already have a valid session,
 * redirecting them to /home. Anonymous visitors pass through normally.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/home']);
  }

  return true;
};
