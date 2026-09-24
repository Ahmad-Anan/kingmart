// jsdom مفيهوش window.matchMedia، والـ Theme service بيستخدمها لقراءة تفضيل الـ dark mode
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  });
}

// Swiper Element الحقيقي بيقع جوه jsdom (مفيش دعم لـ adoptedStyleSheets في الـ shadow DOM).
// register() بيتخطى أي tag متعرف قبل كده، فبنعرّف stubs بسيطة فيها initialize() بس.
if (typeof customElements !== 'undefined') {
  if (!customElements.get('swiper-container')) {
    customElements.define(
      'swiper-container',
      class extends HTMLElement {
        initialize(): void {}
      },
    );
  }
  if (!customElements.get('swiper-slide')) {
    customElements.define('swiper-slide', class extends HTMLElement {});
  }
}
