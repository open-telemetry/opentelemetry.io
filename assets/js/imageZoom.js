// Medium-style click-to-zoom lightbox for content images. Applies to every
// image inside the `.td-content` body, except images that are themselves a
// link (those should follow the link instead). Styles live in
// assets/scss/_image_zoom.scss.

(function () {
  // Content images, but not ones wrapped in a link.
  const SELECTOR = '.td-content img';
  let overlay = null;

  // Checks that no ancestor of the image is a link
  function isZoomable(img) {
    return img.matches(SELECTOR) && !img.closest('a');
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
  }

  function openFrom(el) {
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
      e.preventDefault();
      openFrom(e.target);
    }
  });
})();
