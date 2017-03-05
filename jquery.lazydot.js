(function ($) {
  $.fn.shuffle = function () {
    for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
    return this;
  };

  $.fn.lazydot = function (options) {
    // dotEntrance: pageLoad or scrollEnter
    // if dots display on scrollEnter with an animation, the animation
    // is controlled by CSS, so set a corresponding delay before image loads
    var settings = $.extend({
      dotEntrance: 'pageLoad',
      dotEntranceTime: 0,
      imageFadeDelay: 0,
      dotSize: 18,
      dotMargin: 2,
    }, options);

    var LazyDotImage = function LazyDotImage($wrapper, canvas, context) {
      this.$wrapper = $wrapper;
      this.$thumbImg = $wrapper.find('img.toload');
      this.canvas = canvas;
      this.context = context;
      this.dataSrc = this.$thumbImg.data('src');
      this.loaded = false;
      this.maxWidth = this.$thumbImg.data('width');
      this.width = this.$thumbImg.width();
      this.maxHeight = this.$thumbImg.data('height');
      this.ratio = this.maxHeight / this.maxWidth;
      this.height = this.width * this.ratio;
    };

    LazyDotImage.prototype.setWidthHeight = function setWidthHeight() {
      this.width = this.$thumbImg.width();
      this.height = this.width * this.ratio;
    };

    LazyDotImage.prototype.inViewport = function inViewport(scrollTop, windowHeight) {
      var elTop = this.$wrapper.offset().top + 50;
      var elBottom = elTop + this.$wrapper.outerHeight() - 50;
      var screenBottom = scrollTop + windowHeight;
      return screenBottom > elTop && screenBottom < elBottom || scrollTop > elTop && scrollTop < elBottom || scrollTop < elTop && screenBottom > elBottom;
    };

    LazyDotImage.prototype.loadImage = function loadImage() {
      var $downloadingImage = $("<img>");
      var $myWrapper = this.$wrapper;
      var $targetImg = this.$thumbImg;

      if (settings.dotEntrance === 'scrollEnter') {
        this.toggleDots();
      }

      $downloadingImage.one('load', function () {
        var newsrc = $(this).attr('src');
        $targetImg.attr('src', newsrc);
        // wait for dots
        setTimeout(function () {
          $myWrapper.find('.dot-grid').fadeOut(500, function () {
            $(this).remove();
          });
          $targetImg.addClass('on');
        }, settings.imageFadeDelay);
      });

      $downloadingImage.attr('src', this.dataSrc);
    };

    LazyDotImage.prototype.checkLoad = function checkLoad(scrollTop, windowHeight) {
      if (!this.loaded && this.inViewport(scrollTop, windowHeight)) {
        this.loaded = true;
        this.loadImage();
      }
    };

    LazyDotImage.prototype.toggleDots = function(){
      var $dots = this.$wrapper.find('.dot');
      $dots.shuffle();
      var delay = settings.dotEntranceTime / $dots.length;
      $dots.each(function (index) {
        var indexDelay = index * delay;
        (function ($dot, dotDelay) {
          setTimeout(function () {
            $dot.addClass('on');
          }, dotDelay);
        }($(this), indexDelay));
      });
    };

    LazyDotImage.prototype.drawDots = function drawDots(dotSize, margin) {
      var dots = [];
      var thumbWidth = this.$thumbImg[0].naturalWidth;
      var thumbHeight = this.$thumbImg[0].naturalHeight;
      this.canvas.width = thumbWidth;
      this.canvas.height = thumbHeight;
      this.context.drawImage(this.$thumbImg[0], 0, 0);
      var dotsAcross = Math.floor(this.width / (dotSize + margin));
      var increment = thumbWidth / dotsAcross;
      var dotsDown = Math.floor(this.height / (dotSize + margin));
      var fullToThumbRatio = this.width / thumbWidth;

      for (var i = 0; i < dotsDown; i += 1) {
        for (var j = 0; j < dotsAcross; j += 1) {
          var x = j * increment;
          var y = i * increment;
          var data = this.context.getImageData(x, y, 1, 1);
          var r = data.data[0];
          var g = data.data[1];
          var b = data.data[2];
          var colorString = 'rgb(' + r + ', ' + g + ', ' + b + ')';
          dots.push({
            x: x * fullToThumbRatio,
            y: y * fullToThumbRatio,
            rgbString: colorString,
          });
        }
      }

      var $dotGrid = $('<div class="dot-grid" />')
        .attr({
          style: 'width: ' + this.width + 'px; height: ' + this.height + 'px;'
        }).appendTo(this.$wrapper);

      dots.forEach(function (d) {
        $('<div />').attr({
          class: 'dot',
          style: 'width: ' + dotSize + 'px; height: ' + dotSize + 'px;  left: ' + d.x + 'px; top: ' + d.y + 'px; background: ' + d.rgbString + '; '
        }).appendTo($dotGrid);
      });
    };

    var setAllSizes = function setAllSizes(images) {
      images.forEach(function (d) {
        d.setWidthHeight();
      });
    };

    var checkAllImages = function checkAllImages(images) {
      var scrollTop = $(window).scrollTop();
      var height =  $(window).height();
      images.forEach(function (d) {
        d.checkLoad(scrollTop, height);
      });
    };

    // create and store LazyDotImage objects for each image
    var lazyDotImages = [];
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    this.each(function () {
      var lazyImg = new LazyDotImage($(this), canvas, context);
      lazyImg.drawDots(settings.dotSize, settings.dotMargin);
      lazyDotImages.push(lazyImg);
    });

    // check them on inital call, and on scroll and resize
    // ideally would remove from array after load, but fine for now...
    checkAllImages(lazyDotImages);
    $(window).scroll(function () {
      checkAllImages(lazyDotImages);
    });
    $(window).resize(function () {
      setAllSizes(lazyDotImages);
      checkAllImages(lazyDotImages);
    });
  };
}(jQuery));
