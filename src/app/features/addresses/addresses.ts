// addresses.ts
import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, minLength, pattern, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { IAddAddressRequest } from '../../core/models/address';
import { AddressService } from '../../core/services/address/address';
import { LanguageService } from '../../core/services/language/language';
import { TranslatePipe } from '../../shared/pipes/translate-pipe';

const EGYPT_PHONE_PATTERN = /^01[0125][0-9]{8}$/;

@Component({
  selector: 'app-addresses',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormField,
    FormRoot,
    ButtonModule,
    InputTextModule,
    MessageModule,
    ProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './addresses.html',
  styleUrl: './addresses.css',
})
export class Addresses {
  private readonly addressService = inject(AddressService);
  private readonly languageService = inject(LanguageService);

  readonly addresses = this.addressService.addresses;
  readonly isLoading = signal(true);
  readonly removingAddressId = signal<string | null>(null);

  readonly showAddForm = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly model = signal<IAddAddressRequest>({
    name: '',
    details: '',
    phone: '',
    city: '',
  });

  readonly addressForm = form(
    this.model,
    (p) => {
      required(p.name, { message: () => this.languageService.translate('validation.labelRequired') });
      minLength(p.name, 2, {
        message: () => this.languageService.translate('validation.labelMinLength'),
      });

      required(p.details, {
        message: () => this.languageService.translate('validation.addressDetailsRequired'),
      });
      minLength(p.details, 5, {
        message: () => this.languageService.translate('validation.addressDetailsMinLength'),
      });

      required(p.phone, { message: () => this.languageService.translate('validation.phoneRequired') });
      pattern(p.phone, EGYPT_PHONE_PATTERN, {
        message: () => this.languageService.translate('validation.phoneInvalid'),
      });

      required(p.city, { message: () => this.languageService.translate('validation.cityRequired') });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);

          try {
            await firstValueFrom(this.addressService.addAddress(this.model()));
            this.model.set({ name: '', details: '', phone: '', city: '' });
            this.showAddForm.set(false);
          } catch (err) {
            this.serverError.set(this.resolveErrorMessage(err));
          }
        },
      },
    },
  );

  constructor() {
    afterNextRender(() => {
      this.loadAddresses();
    });
  }

  private loadAddresses(): void {
    this.isLoading.set(true);
    this.addressService.getLoggedUserAddresses().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false),
    });
  }

  toggleAddForm(): void {
    this.serverError.set(null);
    this.showAddForm.update((open) => !open);
  }

  removeAddress(addressId: string): void {
    if (this.removingAddressId()) return;
    this.removingAddressId.set(addressId);
    this.addressService.removeAddress(addressId).subscribe({
      next: () => this.removingAddressId.set(null),
      error: () => this.removingAddressId.set(null),
    });
  }

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse && typeof err.error?.message === 'string') {
      return err.error.message;
    }
    return this.languageService.translate('addresses.genericError');
  }
}
