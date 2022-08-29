(function ($) {
  let $nav = $(".fixed-top");
  let $hero = $(".hero");

  if (window.location.pathname != '/') {
    $nav.addClass("scrolled");
    var navHeight = $('.fixed-top').outerHeight();
    $('body').css({ marginTop : navHeight });
  }
  if (window.location.pathname == '/') {
    $(document).on("scroll", function () {
      $nav.toggleClass("scrolled", $(this).scrollTop() >= $hero.height() - 200);
    });
  }

  let navigationHeight = document.querySelector(".fixed-top").offsetHeight;

  document.documentElement.style.setProperty(
    "--scroll-padding",
    navigationHeight - 1 + "px"
  );

  window.setTimeout(function () {
    $(".toast").slideUp(500, function () {
      $(this).remove();
    });
  }, 10000);
})(jQuery);