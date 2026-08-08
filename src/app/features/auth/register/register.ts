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
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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
      required(p.name, { message: 'Full name is required' });
      minLength(p.name, 3, { message: 'Name must be at least 3 characters' });

      required(p.email, { message: 'Email is required' });
      email(p.email, { message: 'Enter a valid email address' });

      required(p.phone, { message: 'Phone number is required' });
      pattern(p.phone, EGYPT_PHONE_PATTERN, { message: 'Enter a valid Egyptian phone number' });

      required(p.password, { message: 'Password is required' });
      minLength(p.password, 6, { message: 'Password must be at least 6 characters' });

      required(p.rePassword, { message: 'Please confirm your password' });
      validate(p.rePassword, ({ value, valueOf }) =>
        value() === valueOf(p.password)
          ? undefined
          : { kind: 'mismatch', message: 'Passwords do not match' },
      );
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);
          this.termsError.set(null);

          if (!this.termsControl.value) {
            this.termsError.set('Please accept the Terms of Service to continue.');
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
    return 'Something went wrong while creating your account. Please try again.';
  }
}
