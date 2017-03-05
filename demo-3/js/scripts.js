(function ($) {
  $(window).on('load', function () {
    $('.lazydot').lazydot({
      dotEntrance: 'scrollEnter',
      dotSize: 47,
      dotMargin: 3,
      dotEntranceTime: 800,
      imageFadeDelay: 1200,
    });
  });
}(jQuery));
