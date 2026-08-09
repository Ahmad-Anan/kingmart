import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { InputPasswordModule } from 'primeng/inputpassword';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { ISigninRequest } from '../../../core/models/auth';
import { AuthService } from '../../../core/services/auth/auth';
import { LanguageService } from '../../../core/services/language/language';
import { TranslatePipe } from '../../../shared/pipes/translate-pipe';
import { AUTH_TRUST_BADGES } from '../auth-interface/auth-showcase.data';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormField,
    FormRoot,
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    DividerModule,
    InputPasswordModule,
    InputTextModule,
    MessageModule,
    TranslatePipe,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly languageService = inject(LanguageService);

  protected readonly serverError = signal<string | null>(null);
  protected readonly rememberMeControl = new FormControl(false, { nonNullable: true });
  protected readonly hidePassword = signal(true);

  protected readonly trustBadges = AUTH_TRUST_BADGES;

  protected readonly model = signal<ISigninRequest>({
    email: '',
    password: '',
  });

  protected readonly loginForm = form(
    this.model,
    (p) => {
      required(p.email, { message: () => this.languageService.translate('validation.emailRequired') });
      email(p.email, { message: () => this.languageService.translate('validation.emailInvalid') });

      required(p.password, {
        message: () => this.languageService.translate('validation.passwordRequired'),
      });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          try {
            await firstValueFrom(this.authService.signin(this.model()));
            await this.router.navigateByUrl(this.resolveRedirectUrl());
          } catch (err) {
            this.serverError.set(this.resolveErrorMessage(err));
          }
        },
      },
    },
  );

  private resolveRedirectUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    // لازم يكون مسار داخلي نسبي بس — بنرفض أي حاجة ممكن تودي لموقع خارجي
    // (زي "//evil.com" أو "https://evil.com") عشان نمنع open-redirect
    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') && !returnUrl.includes('://')) {
      return returnUrl;
    }
    return '/home';
  }

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse && typeof err.error?.message === 'string') {
      return err.error.message;
    }
    return this.languageService.translate('auth.login.genericError');
  }
}
