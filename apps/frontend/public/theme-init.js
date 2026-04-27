// Anti-FOUC: runs before React hydration to apply the stored theme.
// Placing this in /public and loading it with strategy="beforeInteractive"
// keeps the logic readable without needing an inline script string in layout.tsx.
(function () {
  try {
    var stored = localStorage.getItem('zenithflix-theme');
    if (stored === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch (_) {
    // localStorage may be unavailable (SSR, private browsing with strict settings, etc.)
  }
})();
