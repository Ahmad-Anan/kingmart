import { TranslationKey } from '../../../core/i18n/en';

export interface IStatHighlight {
  icon: string;
  value: string;
  labelKey: TranslationKey;
}

export interface IIconFeature {
  icon: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}

export const AUTH_STAT_HIGHLIGHTS: readonly IStatHighlight[] = [
  { icon: 'pi pi-users', value: '50K+', labelKey: 'auth.showcase.statsCustomers' },
  { icon: 'pi pi-box', value: '10K+', labelKey: 'auth.showcase.statsProducts' },
  { icon: 'pi pi-star', value: '4.9/5', labelKey: 'auth.showcase.statsRating' },
];

export const AUTH_MEMBER_BENEFITS: readonly IIconFeature[] = [
  {
    icon: 'pi pi-percentage',
    titleKey: 'auth.showcase.discountsTitle',
    descriptionKey: 'auth.showcase.discountsDescription',
  },
  {
    icon: 'pi pi-bolt',
    titleKey: 'auth.showcase.earlyAccessTitle',
    descriptionKey: 'auth.showcase.earlyAccessDescription',
  },
  {
    icon: 'pi pi-heart',
    titleKey: 'auth.showcase.wishlistTitle',
    descriptionKey: 'auth.showcase.wishlistDescription',
  },
];

export const AUTH_TRUST_BADGES: readonly IIconFeature[] = [
  {
    icon: 'pi pi-truck',
    titleKey: 'auth.showcase.deliveryTitle',
    descriptionKey: 'auth.showcase.deliveryDescription',
  },
  {
    icon: 'pi pi-shield',
    titleKey: 'auth.showcase.paymentsTitle',
    descriptionKey: 'auth.showcase.paymentsDescription',
  },
  {
    icon: 'pi pi-verified',
    titleKey: 'auth.showcase.authenticTitle',
    descriptionKey: 'auth.showcase.authenticDescription',
  },
];

export const AUTH_RESET_REASSURANCE: readonly IIconFeature[] = [
  {
    icon: 'pi pi-shield',
    titleKey: 'auth.showcase.securityTitle',
    descriptionKey: 'auth.showcase.securityDescription',
  },
  {
    icon: 'pi pi-envelope',
    titleKey: 'auth.showcase.emailVerifyTitle',
    descriptionKey: 'auth.showcase.emailVerifyDescription',
  },
  {
    icon: 'pi pi-clock',
    titleKey: 'auth.showcase.quickTitle',
    descriptionKey: 'auth.showcase.quickDescription',
  },
];
