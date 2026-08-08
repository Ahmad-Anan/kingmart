import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { InputPasswordModule } from 'primeng/inputpassword';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { ISigninRequest } from '../../../core/models/auth';
import { AuthService } from '../../../core/services/auth/auth';
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
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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
      required(p.email, { message: 'Email is required' });
      email(p.email, { message: 'Enter a valid email address' });

      required(p.password, { message: 'Password is required' });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          try {
            await firstValueFrom(this.authService.signin(this.model()));
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
    return 'Something went wrong while signing in. Please try again.';
  }
}
