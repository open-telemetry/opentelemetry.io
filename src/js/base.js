const tracer = require('./tracing');
(function ($) {

  'use strict';

  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();

    $('.popover-dismiss').popover({
      trigger: 'focus'
    })
  });


  function bottomPos(element) {
    return element.offset().top + element.outerHeight();
  }

  // Bootstrap Fixed Header
  $(function () {
    var promo = $(".js-td-cover");
    if (!promo.length) {
      return
    }

    const announcementThreshold = Math.ceil($('section#announcement').outerHeight()) || -1;
    // announcement_size + td-cover-block-0.padding-top/128px + img.padding-top/16 - nav.height/64px
    const threshold = announcementThreshold + 128 + 16 - 64;
    const onScroll = () => {
      var navbarOffset = $('.js-navbar-scroll').offset().top;
      if (navbarOffset > threshold) {
        $('.js-navbar-scroll').addClass('navbar-bg-onscroll');
      } else {
        $('.js-navbar-scroll').removeClass('navbar-bg-onscroll');
        $('.js-navbar-scroll').addClass('navbar-bg-onscroll--fade');
      }

      var pageOffset = window.pageYOffset || document.documentElement.scrollTop;
      if (pageOffset < announcementThreshold) {
        $('.js-navbar-scroll').addClass('navbar-position-absolute').css("top", `${announcementThreshold}px`);
      } else {
        $('.js-navbar-scroll').removeClass('navbar-position-absolute').css("top", "0");
      }
    }

    onScroll()
    $(window).on('scroll', function () {
      onScroll()
    });
  });

  var Search = {
    init: function () {
      $(document).ready(function () {
        $(document).on('keypress', '.td-search-input', function (e) {
          if (e.keyCode !== 13) {
            return
          }

          var query = $(this).val();
          var searchPage = window.location.origin + "/search/?q=" + query;
          document.location = searchPage;

          return false;
        });

      });
    },
  };

  Search.init();


}(jQuery));
