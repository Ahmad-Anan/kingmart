// reviews.ts
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { Review } from '../../core/models/reviews-response';
import { AuthService } from '../../core/services/auth/auth';
import { ReviewsService } from '../../core/services/Reviews/reviews';

@Component({
  selector: 'app-reviews',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, FormsModule, RouterLink, ProgressSpinnerModule],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class Reviews {
  private readonly reviewsService = inject(ReviewsService);
  private readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  readonly productId = input.required<string>();
  readonly ratingsAverage = input<number>(0);
  readonly ratingsQuantity = input<number>(0);

  readonly starValues = [1, 2, 3, 4, 5] as const;

  readonly isLoggedIn = this.authService.isLoggedIn;
  private readonly currentUserId = computed(() => this.authService.currentUser()?._id);

  readonly reviewsResource = rxResource({
    params: () => this.productId(),
    stream: ({ params: id }) => this.reviewsService.getReviewsForProduct(id),
  });

  private readonly reviews = computed(() => this.reviewsResource.value()?.data ?? []);
  readonly myReview = computed(() =>
    this.reviews().find((review) => review.user._id === this.currentUserId()),
  );
  readonly otherReviews = computed(() =>
    this.reviews().filter((review) => review.user._id !== this.currentUserId()),
  );

  readonly roundedAverage = computed(() => Math.round(this.ratingsAverage()));

  readonly isEditing = signal(false);
  readonly formRating = signal(0);
  readonly formText = signal('');
  readonly submitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly deletingOwn = signal(false);

  setRating(value: number): void {
    this.formRating.set(value);
  }

  startEdit(): void {
    const review = this.myReview();
    if (!review) return;

    this.formRating.set(review.rating);
    this.formText.set(review.review);
    this.formError.set(null);
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.formRating.set(0);
    this.formText.set('');
    this.formError.set(null);
  }

  submitReview(): void {
    if (this.submitting()) return;

    this.formError.set(null);

    if (this.formRating() < 1) {
      this.formError.set('Please select a star rating.');
      return;
    }

    const comment = this.formText().trim();
    if (!comment) {
      this.formError.set('Please write a comment.');
      return;
    }

    const payload = { review: comment, rating: this.formRating() };
    const existing = this.myReview();

    this.submitting.set(true);
    const request$ =
      this.isEditing() && existing
        ? this.reviewsService.updateReview(existing._id, payload)
        : this.reviewsService.createReview(this.productId(), payload);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.isEditing.set(false);
        this.formRating.set(0);
        this.formText.set('');
        this.reviewsResource.reload();
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.formError.set(this.resolveErrorMessage(err));
      },
    });
  }

  deleteOwnReview(): void {
    const existing = this.myReview();
    if (!existing || this.deletingOwn()) return;

    this.deletingOwn.set(true);
    this.reviewsService.deleteReview(existing._id).subscribe({
      next: () => {
        this.deletingOwn.set(false);
        this.reviewsResource.reload();
      },
      error: () => this.deletingOwn.set(false),
    });
  }

  trackByReviewId(_index: number, review: Review): string {
    return review._id;
  }

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse && typeof err.error?.message === 'string') {
      return err.error.message;
    }
    return 'Something went wrong while saving your review. Please try again.';
  }
}
