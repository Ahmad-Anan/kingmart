import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  email,
  form,
  FormField,
  FormRoot,
  minLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputPasswordModule } from 'primeng/inputpassword';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { ISignupRequest } from '../../../core/models/auth';
import { AuthService } from '../../../core/services/auth/auth';
import { LanguageService } from '../../../core/services/language/language';
import { TranslatePipe } from '../../../shared/pipes/translate-pipe';
import { AUTH_MEMBER_BENEFITS, AUTH_STAT_HIGHLIGHTS } from '../auth-interface/auth-showcase.data';

const EGYPT_PHONE_PATTERN = /^01[0125][0-9]{8}$/;

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormField,
    FormRoot,
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputPasswordModule,
    InputTextModule,
    MessageModule,
    TranslatePipe,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  protected readonly serverError = signal<string | null>(null);
  protected readonly termsControl = new FormControl(false, { nonNullable: true });
  protected readonly termsError = signal<string | null>(null);
  protected readonly hidePassword = signal(true);
  protected readonly hideRePassword = signal(true);

  protected readonly statHighlights = AUTH_STAT_HIGHLIGHTS;
  protected readonly memberBenefits = AUTH_MEMBER_BENEFITS;

  protected readonly model = signal<ISignupRequest>({
    name: '',
    email: '',
    phone: '',
    password: '',
    rePassword: '',
  });

  protected readonly registerForm = form(
    this.model,
    (p) => {
      required(p.name, { message: () => this.languageService.translate('validation.fullNameRequired') });
      minLength(p.name, 3, {
        message: () => this.languageService.translate('validation.nameMinLength'),
      });

      required(p.email, { message: () => this.languageService.translate('validation.emailRequired') });
      email(p.email, { message: () => this.languageService.translate('validation.emailInvalid') });

      required(p.phone, { message: () => this.languageService.translate('validation.phoneRequired') });
      pattern(p.phone, EGYPT_PHONE_PATTERN, {
        message: () => this.languageService.translate('validation.phoneInvalid'),
      });

      required(p.password, {
        message: () => this.languageService.translate('validation.passwordRequired'),
      });
      minLength(p.password, 6, {
        message: () => this.languageService.translate('validation.passwordMinLength'),
      });

      required(p.rePassword, {
        message: () => this.languageService.translate('validation.confirmPasswordRequired'),
      });
      validate(p.rePassword, ({ value, valueOf }) =>
        value() === valueOf(p.password)
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
          this.termsError.set(null);

          if (!this.termsControl.value) {
            this.termsError.set(this.languageService.translate('auth.register.termsRequired'));
            return;
          }

          try {
            await firstValueFrom(this.authService.signup(this.model()));
            await this.router.navigateByUrl('/home');
          } catch (err) {
            this.serverError.set(this.resolveErrorMessage(err));
          }
        },
      },
    },
  );

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse && typeof err.error?.message === 'string') {
      return err.error.message;
    }
    return this.languageService.translate('auth.register.genericError');
  }
}
