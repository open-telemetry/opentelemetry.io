// Medium-style click-to-zoom lightbox for content images. Applies to images
// inside the `.td-content` body that are large enough to be worth zooming,
// except images that are themselves a link (those should follow the link
// instead). The size gate keeps small images — badges, logos, SDK icons — from
// becoming zoomable. Styles live in assets/scss/_image_zoom.scss.

(function () {
  // Content images, but not ones wrapped in a link.
  const SELECTOR = '.td-content img';
  // Minimum intrinsic size (px) for an image to be zoomable. Images smaller
  // than this in both dimensions are treated as icons/badges and skipped.
  const MIN_SIZE = 200;
  let overlay = null;
  // The image whose overlay is currently open, so its aria-expanded can be
  // reset when the overlay closes.
  let activeImg = null;

  // True once the image has reported its intrinsic size and at least one
  // dimension clears the threshold. naturalWidth/naturalHeight are 0 until the
  // image loads, so callers should only rely on this for loaded images.
  function isLargeEnough(img) {
    return img.naturalWidth >= MIN_SIZE || img.naturalHeight >= MIN_SIZE;
  }

  // Checks that the image is content-body, not a link, and large enough.
  function isZoomable(img) {
    return img.matches(SELECTOR) && !img.closest('a') && isLargeEnough(img);
  }

  // Tags qualifying images with `td-zoomable` so the CSS can show the zoom-in
  // cursor only on images that actually zoom, and makes them keyboard-operable:
  // `tabindex` puts them in the tab order and `role="button"` tells assistive
  // tech they're interactive, so the Enter/Space handler below can reach them.
  // Intrinsic size is unknown until load, so defer the check for images that
  // aren't loaded yet.
  function markZoomable(img) {
    if (isZoomable(img)) {
      img.classList.add('td-zoomable');
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-expanded', 'false');
    }
  }

  function markAllZoomable() {
    document.querySelectorAll(SELECTOR).forEach(function (img) {
      if (img.complete) {
        markZoomable(img);
      } else {
        img.addEventListener('load', function () {
          markZoomable(img);
        });
      }
    });
  }

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'td-zoom-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const img = document.createElement('img');
    img.className = 'td-zoom-overlay__img';
    img.alt = '';
    overlay.appendChild(img);

    overlay.addEventListener('click', close);
    document.body.appendChild(overlay);
    return overlay;
  }

  function open(src, alt) {
    if (!overlay) buildOverlay();
    const img = overlay.querySelector('.td-zoom-overlay__img');
    img.src = src;
    img.alt = alt || '';
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    document.body.classList.add('td-zoom-open');
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('td-zoom-open');
    if (activeImg) {
      activeImg.setAttribute('aria-expanded', 'false');
      activeImg = null;
    }
  }

  function openFrom(el) {
    activeImg = el;
    el.setAttribute('aria-expanded', 'true');
    open(el.currentSrc || el.src, el.alt);
  }

  // Handles images present at load and any added later.
  document.addEventListener('click', function (e) {
    const img = e.target.closest('img');
    if (img && isZoomable(img)) openFrom(img);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (
      (e.key === 'Enter' || e.key === ' ') &&
      e.target.tagName === 'IMG' &&
      isZoomable(e.target)
    ) {
      e.preventDefault(); // Space would otherwise scroll the page
      openFrom(e.target);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markAllZoomable);
  } else {
    markAllZoomable();
  }
})();
