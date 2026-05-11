// Kapa preinitialization: queue API calls until the widget bundle loads.
// https://docs.kapa.ai/integrations/website-widget/javascript-api/preinitialize
(function () {
  if (!window.Kapa) {
    var i = function () {
      i.c(arguments);
    };
    i.q = [];
    i.c = function (args) {
      i.q.push(args);
    };
    window.Kapa = i;
  }
})();

// Set data-kapa-near-footer on <html> when the site footer is in view and
// the Kapa modal is closed, so CSS can fade the launcher without doing so
// while the modal is open. See #9676, #9689.
(function () {
  var root = document.documentElement;
  var modalOpen = false;
  var footerVisible = false;

  function update() {
    if (footerVisible && !modalOpen) {
      root.setAttribute('data-kapa-near-footer', '');
    } else {
      root.removeAttribute('data-kapa-near-footer');
    }
  }

  window.Kapa('onModalOpen', function () {
    modalOpen = true;
    update();
  });
  window.Kapa('onModalClose', function () {
    modalOpen = false;
    update();
  });

  function observeFooter() {
    if (!('IntersectionObserver' in window)) return;
    var footer = document.querySelector('footer.td-footer');
    if (!footer) return;
    var io = new IntersectionObserver(function (entries) {
      footerVisible = entries[0].isIntersecting;
      update();
    });
    io.observe(footer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeFooter);
  } else {
    observeFooter();
  }
})();
