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
  ],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css',
})
export class ForgetPassword {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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
      required(p.email, { message: 'Email is required' });
      email(p.email, { message: 'Enter a valid email address' });
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
      required(p.resetCode, { message: 'The reset code is required' });
      minLength(p.resetCode, 6, { message: 'Enter the full 6-digit code' });
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
      required(p.newPassword, { message: 'New password is required' });
      minLength(p.newPassword, 6, { message: 'Password must be at least 6 characters' });

      required(p.confirmPassword, { message: 'Please confirm your new password' });
      validate(p.confirmPassword, ({ value, valueOf }) =>
        value() === valueOf(p.newPassword)
          ? undefined
          : { kind: 'mismatch', message: 'Passwords do not match' },
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
    return 'Something went wrong. Please try again.';
  }
}
