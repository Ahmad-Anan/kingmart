// Automated portfolio screenshots for KingMart.
//
// Usage:
//   node scripts/screenshots.mjs
//   node scripts/screenshots.mjs 01 03        (only shots whose file name starts with these prefixes)
//
// Env vars:
//   BASE_URL       default https://kingmart.vercel.app
//   DEMO_EMAIL     required only for shots with auth: true
//   DEMO_PASSWORD  required only for shots with auth: true
//
// Theme & locale are set exactly the way the app persists them (see
// src/app/core/services/theme/theme.ts and src/app/core/services/language/language.ts):
//   localStorage['app-theme']  = 'dark' | 'light'  -> Theme adds/removes `my-app-dark` on <html>
//   localStorage['app-locale'] = 'en' | 'ar'       -> LanguageService sets <html lang/dir>
// Both are written by an init script before any page script runs, so the inline anti-flicker
// scripts in index.html pick them up on first paint.

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Shots — edit freely
// ---------------------------------------------------------------------------
const DESKTOP = { width: 1440, height: 900 };
const IPHONE_16_PRO_MAX = { width: 440, height: 956 };

// Canon EOS M50 Mark II — clean product photography on white + has real reviews in the API.
// clientNav: the live Vercel deploy 404s on a hard load of SSR-only routes (product-details,
// brands/:id, categories/:id), so those shots boot on /home and navigate in-app instead.
const PRODUCT_PATH =
  '/product-details/6408e43a6406cd15828e8f22/eos-m50-mark-ii-mirrorless-digital-camera-with-15-45mm-lens-black';

const SHOTS = [
  { file: '01-home-desktop-dark-en.png', path: '/home', viewport: DESKTOP, dpr: 2, theme: 'dark', locale: 'en' },
  { file: '02-product-desktop-dark-en.png', path: PRODUCT_PATH, viewport: DESKTOP, dpr: 2, theme: 'dark', locale: 'en', clientNav: true },
  { file: '03-cart-desktop-dark-en.png', path: '/cart', viewport: DESKTOP, dpr: 2, theme: 'dark', locale: 'en', auth: true },
  { file: '04-home-mobile-dark-ar.png', path: '/home', viewport: IPHONE_16_PRO_MAX, dpr: 3, mobile: true, theme: 'dark', locale: 'ar' },
  { file: '05-home-desktop-light-en.png', path: '/home', viewport: DESKTOP, dpr: 2, theme: 'light', locale: 'en' },
  { file: '06-home-mobile-light-ar.png', path: '/home', viewport: IPHONE_16_PRO_MAX, dpr: 3, mobile: true, theme: 'light', locale: 'ar' },
];

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const BASE_URL = (process.env.BASE_URL || 'https://kingmart.vercel.app').replace(/\/+$/, '');
const DEMO_EMAIL = process.env.DEMO_EMAIL;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;
const OUT_DIR = path.resolve('screenshots');
const SETTLE_MS = 1500;
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

// Hidden from first paint (scrollbars only — no layout-affecting rules).
const SCROLLBAR_CSS = `
  html, body { scrollbar-width: none !important; }
  ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
`;

// Injected right before capture to freeze motion without touching layout.
const FREEZE_CSS = `
  *, *::before, *::after {
    animation-play-state: paused !important;
    transition: none !important;
    caret-color: transparent !important;
  }
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function newContext(browser, shot, storageState) {
  const context = await browser.newContext({
    viewport: shot.viewport,
    deviceScaleFactor: shot.dpr,
    isMobile: !!shot.mobile,
    hasTouch: !!shot.mobile,
    userAgent: shot.mobile ? MOBILE_UA : undefined,
    colorScheme: shot.theme,
    locale: shot.locale === 'ar' ? 'ar-EG' : 'en-US',
    storageState,
  });

  // Persist theme/locale the same way the app does, before any app script runs.
  await context.addInitScript(
    ({ theme, locale, css }) => {
      try {
        localStorage.setItem('app-theme', theme);
        localStorage.setItem('app-locale', locale);
      } catch {}
      const inject = () => {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
      };
      if (document.head) inject();
      else document.addEventListener('DOMContentLoaded', inject, { once: true });
    },
    { theme: shot.theme, locale: shot.locale, css: SCROLLBAR_CSS },
  );

  return context;
}

async function login(browser) {
  // Log in through the real /login form; the app stores userToken/userData in localStorage.
  const context = await newContext(browser, SHOTS.find((s) => s.auth) ?? SHOTS[0]);
  const page = await context.newPage();
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.locator('#login-email').fill(DEMO_EMAIL);
    await page.locator('#login-password').fill(DEMO_PASSWORD);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/v1/auth/signin'), { timeout: 30_000 }),
      page.locator('form button[type="submit"]').click(),
    ]);
    await page.waitForFunction(() => !!localStorage.getItem('userToken'), null, { timeout: 15_000 });
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15_000 });
    return await context.storageState();
  } finally {
    await context.close();
  }
}

async function waitForNetworkIdle(page, timeout = 20_000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch {
    console.warn('    (network did not go fully idle, continuing)');
  }
}

async function scrollThroughPage(page) {
  // Step down gradually so IntersectionObserver-based lazy content (@defer, loading="lazy") fires.
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await delay(150);
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await delay(400);
    window.scrollTo(0, 0);
    await delay(300);
  });
}

async function waitForVisibleImages(page, timeout = 20_000) {
  try {
    await page.waitForFunction(
      () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        return [...document.images].every((img) => {
          const r = img.getBoundingClientRect();
          const visible = r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < vh && r.left < vw;
          return !visible || (img.complete && img.naturalWidth > 0);
        });
      },
      null,
      { timeout, polling: 250 },
    );
    // Make sure decoding is done too, so nothing paints half-way.
    await page.evaluate(() =>
      Promise.all([...document.images].filter((i) => i.complete).map((i) => i.decode().catch(() => {}))),
    );
  } catch {
    console.warn('    (some visible images did not finish loading in time)');
  }
}

async function resetHeroSlider(page) {
  // The hero Swiper autoplays 2s after init — stop it and jump to the first slide instantly.
  const found = await page.evaluate(async () => {
    const el = document.querySelector('app-home-slider swiper-container');
    if (!el) return false;
    for (let i = 0; i < 40 && !el.swiper; i++) await new Promise((r) => setTimeout(r, 250));
    const swiper = el.swiper;
    if (!swiper) return false;
    swiper.autoplay?.stop();
    if (swiper.params?.loop) swiper.slideToLoop(0, 0, false);
    else swiper.slideTo(0, 0, false);
    return true;
  });
  if (found) await page.waitForTimeout(300);
}

async function dismissToasts(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.p-toast .p-toast-close-button').forEach((b) => b.click());
  });
  try {
    await page.waitForFunction(() => !document.querySelector('.p-toast .p-toast-message'), null, {
      timeout: 5_000,
    });
  } catch {
    console.warn('    (a toast is still visible)');
  }
}

async function capture(browser, shot, storageState) {
  const context = await newContext(browser, shot, storageState);
  const page = await context.newPage();
  try {
    if (shot.clientNav) {
      await page.goto(`${BASE_URL}/home`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await waitForNetworkIdle(page);
      // Angular's Router listens to popstate, so this is a normal in-app navigation.
      await page.evaluate((p) => {
        history.pushState(null, '', p);
        window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
      }, shot.path);
      await page.waitForURL((url) => url.pathname === shot.path.split('?')[0], { timeout: 15_000 });
    } else {
      await page.goto(`${BASE_URL}${shot.path}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    }
    await waitForNetworkIdle(page);

    if (shot.auth && new URL(page.url()).pathname.startsWith('/login')) {
      throw new Error('redirected to /login — auth did not stick');
    }

    await page.evaluate(() => document.fonts.ready);
    await scrollThroughPage(page);
    await waitForNetworkIdle(page, 10_000);
    await waitForVisibleImages(page);
    await page.evaluate(() => document.fonts.ready);

    // Sanity check that the app applied the requested state.
    const state = await page.evaluate(() => ({
      dark: document.documentElement.classList.contains('my-app-dark'),
      dir: document.documentElement.dir,
    }));
    if (state.dark !== (shot.theme === 'dark') || state.dir !== (shot.locale === 'ar' ? 'rtl' : 'ltr')) {
      console.warn(`    (unexpected state: ${JSON.stringify(state)})`);
    }

    await page.waitForTimeout(SETTLE_MS);

    await resetHeroSlider(page);
    await dismissToasts(page);
    if (!shot.mobile) await page.mouse.move(-10, -10);
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      document.activeElement?.blur?.();
    });
    await page.addStyleTag({ content: FREEZE_CSS });
    await page.waitForTimeout(150);

    await page.screenshot({
      path: path.join(OUT_DIR, shot.file),
      fullPage: false,
      animations: 'disabled',
      caret: 'hide',
    });
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const filters = process.argv.slice(2);
const shots = filters.length ? SHOTS.filter((s) => filters.some((f) => s.file.startsWith(f))) : SHOTS;

await mkdir(OUT_DIR, { recursive: true });
console.log(`BASE_URL: ${BASE_URL}`);
console.log(`Output:   ${OUT_DIR}\n`);

const browser = await chromium.launch();
const results = [];
let storageState;
let loginError;

try {
  if (shots.some((s) => s.auth)) {
    if (!DEMO_EMAIL || !DEMO_PASSWORD) {
      loginError = 'DEMO_EMAIL / DEMO_PASSWORD not set';
    } else {
      process.stdout.write('Logging in… ');
      try {
        storageState = await login(browser);
        console.log('ok\n');
      } catch (err) {
        loginError = `login failed: ${err.message}`;
        console.log('FAILED\n');
      }
    }
  }

  for (const shot of shots) {
    process.stdout.write(`• ${shot.file} `);
    if (shot.auth && !storageState) {
      console.log(`SKIPPED (${loginError})`);
      results.push({ file: shot.file, status: 'skipped' });
      continue;
    }
    try {
      await capture(browser, shot, shot.auth ? storageState : undefined);
      console.log('ok');
      results.push({ file: shot.file, status: 'ok' });
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      results.push({ file: shot.file, status: 'failed' });
    }
  }
} finally {
  await browser.close();
}

const ok = results.filter((r) => r.status === 'ok').length;
console.log(`\n${ok}/${results.length} shots captured.`);
if (results.some((r) => r.status === 'failed')) process.exitCode = 1;
