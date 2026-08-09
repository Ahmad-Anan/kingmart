import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  minLength,
  required,
  validate,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputPasswordModule } from 'primeng/inputpassword';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../../core/services/auth/auth';
import { LanguageService } from '../../../core/services/language/language';
import { TranslatePipe } from '../../../shared/pipes/translate-pipe';
import { AUTH_RESET_REASSURANCE } from '../auth-interface/auth-showcase.data';

type Step = 'email' | 'code' | 'password' | 'done';

@Component({
  selector: 'app-forget-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormField,
    FormRoot,
    ButtonModule,
    InputPasswordModule,
    InputTextModule,
    MessageModule,
    TranslatePipe,
  ],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css',
})
export class ForgetPassword {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  protected readonly step = signal<Step>('email');
  protected readonly serverError = signal<string | null>(null);
  protected readonly hidePassword = signal(true);
  protected readonly hideConfirmPassword = signal(true);

  protected readonly reassurance = AUTH_RESET_REASSURANCE;

  // نحتفظ بالإيميل هنا عشان نستخدمه في خطوتي الكود وكلمة السر الجديدة
  private submittedEmail = '';

  // ── Step 1: Email ──────────────────────────────────────────
  protected readonly emailModel = signal({ email: '' });

  protected readonly emailForm = form(
    this.emailModel,
    (p) => {
      required(p.email, { message: () => this.languageService.translate('validation.emailRequired') });
      email(p.email, { message: () => this.languageService.translate('validation.emailInvalid') });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);
          try {
            await firstValueFrom(
              this.authService.forgotPassword({ email: this.emailModel().email }),
            );
            this.submittedEmail = this.emailModel().email;
            this.step.set('code');
          } catch (err) {
            this.serverError.set(this.resolveErrorMessage(err));
          }
        },
      },
    },
  );

  // ── Step 2: Reset code ─────────────────────────────────────
  protected readonly codeModel = signal({ resetCode: '' });

  protected readonly codeForm = form(
    this.codeModel,
    (p) => {
      required(p.resetCode, {
        message: () => this.languageService.translate('validation.resetCodeRequired'),
      });
      minLength(p.resetCode, 6, {
        message: () => this.languageService.translate('validation.resetCodeLength'),
      });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);
          try {
            await firstValueFrom(
              this.authService.verifyResetCode({ resetCode: this.codeModel().resetCode }),
            );
            this.step.set('password');
          } catch (err) {
            this.serverError.set(this.resolveErrorMessage(err));
          }
        },
      },
    },
  );

  // ── Step 3: New password ───────────────────────────────────
  protected readonly passwordModel = signal({ newPassword: '', confirmPassword: '' });

  protected readonly passwordForm = form(
    this.passwordModel,
    (p) => {
      required(p.newPassword, {
        message: () => this.languageService.translate('validation.newPasswordRequired'),
      });
      minLength(p.newPassword, 6, {
        message: () => this.languageService.translate('validation.passwordMinLength'),
      });

      required(p.confirmPassword, {
        message: () => this.languageService.translate('validation.confirmNewPasswordRequired'),
      });
      validate(p.confirmPassword, ({ value, valueOf }) =>
        value() === valueOf(p.newPassword)
          ? undefined
          : {
              kind: 'mismatch',
              message: this.languageService.translate('validation.passwordMismatch'),
            },
      );
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);
          try {
            await firstValueFrom(
              this.authService.resetPassword({
                email: this.submittedEmail,
                newPassword: this.passwordModel().newPassword,
              }),
            );
            this.step.set('done');
          } catch (err) {
            this.serverError.set(this.resolveErrorMessage(err));
          }
        },
      },
    },
  );

  protected async resendCode(): Promise<void> {
    this.serverError.set(null);
    try {
      await firstValueFrom(this.authService.forgotPassword({ email: this.submittedEmail }));
    } catch (err) {
      this.serverError.set(this.resolveErrorMessage(err));
    }
  }

  protected async goToSignIn(): Promise<void> {
    await this.router.navigateByUrl('/login');
  }

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse && typeof err.error?.message === 'string') {
      return err.error.message;
    }
    return this.languageService.translate('auth.forgetPassword.genericError');
  }
}
