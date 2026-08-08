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

const EGYPT_PHONE_PATTERN = /^01[0125][0-9]{8}$/;

@Component({
  selector: 'app-addresses',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, FormRoot, ButtonModule, InputTextModule, MessageModule, ProgressSpinnerModule],
  templateUrl: './addresses.html',
  styleUrl: './addresses.css',
})
export class Addresses {
  private readonly addressService = inject(AddressService);

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
      required(p.name, { message: 'Label is required (e.g. Home, Work)' });
      minLength(p.name, 2, { message: 'Label must be at least 2 characters' });

      required(p.details, { message: 'Address details are required' });
      minLength(p.details, 5, { message: 'Please provide more detail' });

      required(p.phone, { message: 'Phone number is required' });
      pattern(p.phone, EGYPT_PHONE_PATTERN, { message: 'Enter a valid Egyptian phone number' });

      required(p.city, { message: 'City is required' });
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
    return 'Something went wrong while saving this address. Please try again.';
  }
}
