export interface IStatHighlight {
  icon: string;
  value: string;
  label: string;
}

export interface IIconFeature {
  icon: string;
  title: string;
  description: string;
}

export const AUTH_STAT_HIGHLIGHTS: readonly IStatHighlight[] = [
  { icon: 'pi pi-users', value: '50K+', label: 'Happy customers' },
  { icon: 'pi pi-box', value: '10K+', label: 'Premium products' },
  { icon: 'pi pi-star', value: '4.9/5', label: 'Average rating' },
];

export const AUTH_MEMBER_BENEFITS: readonly IIconFeature[] = [
  {
    icon: 'pi pi-percentage',
    title: 'Member-only discounts',
    description: 'Unlock exclusive pricing available only to registered members.',
  },
  {
    icon: 'pi pi-bolt',
    title: 'Early access to drops',
    description: 'Be the first to shop new arrivals and limited collections.',
  },
  {
    icon: 'pi pi-heart',
    title: 'Wishlist & order tracking',
    description: 'Save favorites and follow every order from checkout to delivery.',
  },
];

export const AUTH_TRUST_BADGES: readonly IIconFeature[] = [
  {
    icon: 'pi pi-truck',
    title: 'Fast Nationwide Delivery',
    description: 'Every order arrives within 24–48 hours, anywhere in Egypt.',
  },
  {
    icon: 'pi pi-shield',
    title: '100% Secure Payments',
    description: 'Bank-level encryption protects every transaction you make.',
  },
  {
    icon: 'pi pi-verified',
    title: 'Guaranteed Authentic',
    description: 'Every product is backed by our genuine-item guarantee.',
  },
];

export const AUTH_RESET_REASSURANCE: readonly IIconFeature[] = [
  {
    icon: 'pi pi-shield',
    title: 'Bank-Level Security',
    description: 'Your account and payment details stay fully encrypted, always.',
  },
  {
    icon: 'pi pi-envelope',
    title: 'Verified by Email',
    description: 'Reset codes are only ever sent to your registered email address.',
  },
  {
    icon: 'pi pi-clock',
    title: 'Quick & Simple',
    description: 'Regain access to your account in under a minute, no hassle.',
  },
];
