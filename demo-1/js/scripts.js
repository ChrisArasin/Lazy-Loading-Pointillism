(function( $ ) {
  /* UTILS */
  $.fn.shuffle = function(){
      for(var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
      return this;
  };

function LazyDotImage ($wrapper, canvas, context ) {
  this.$wrapper = $wrapper;
  this.$thumbImg =  $wrapper.find('.toload');
  this.maxWidth = this.$thumbImg.data('width');
  this.width = this.$thumbImg.width();
  this.maxHeight = this.$thumbImg.data('height');
  this.canvas = canvas;
  this.context = context;
  this.dataSrc = this.$thumbImg.data('src');
  this.loaded = false;
  this.ratio =  this.maxHeight / this.maxWidth;
  this.height = this.width * this.ratio;
  var paddingPercent =  this.ratio * 100;
}
LazyDotImage.prototype.setWidthHeight = function() {
  this.width = this.$thumbImg.width();
  this.height = this.width * this.ratio;
}
LazyDotImage.prototype.inViewport = function(scrollTop, windowHeight) {
  var elTop = this.$wrapper.offset().top + 50; //little bit extra so more on screen for dots
  var elBottom = elTop + this.$wrapper.outerHeight() - 50;
  var screenBottom = scrollTop + windowHeight;
  return screenBottom > elTop && screenBottom < elBottom || scrollTop > elTop && scrollTop < elBottom || scrollTop < elTop && screenBottom > elBottom;
}
LazyDotImage.prototype.loadImage = function(){

  var $downloadingImage = $("<img>");
  var $myWrapper = this.$wrapper;
  var $targetImg = this.$thumbImg;

  $downloadingImage.on('load', function(){
    var newsrc = $(this).attr('src');
    $targetImg.attr('src', newsrc);
    //let us see dots a little while after load
    setTimeout(function(){

      $myWrapper.find('.dot-grid').fadeOut(500, function(){
        $(this).remove();
      });
      $targetImg.addClass('on');
    }, 800);
  });
  $downloadingImage.attr("src", this.dataSrc);
}
LazyDotImage.prototype.checkLoad = function(scrollTop, windowHeight){
  if (! this.loaded && this.inViewport(scrollTop, windowHeight)){
    this.loaded = true;
    this.loadImage();
  }
}

LazyDotImage.prototype.drawDots  = function(dotSize, margin) {
  var dots = [];
  var thumbWidth = this.$thumbImg[0].naturalWidth;
  var thumbHeight = this.$thumbImg[0].naturalHeight;
  this.canvas.width = thumbWidth;
  this.canvas.height = thumbHeight;
  this.context.drawImage(this.$thumbImg[0], 0, 0);
  var dotsAcross = Math.floor( this.width / (dotSize + margin ) );
  var increment = thumbWidth / dotsAcross;
  var dotsDown =  Math.floor( this.height / (dotSize + margin));
  // var heightIncrement = thumbHeight / dotsDown;

  var fullToThumbRatio = this.width / thumbWidth;

  for (var i = 0; i < dotsDown; i++) {
    for (var j = 0; j < dotsAcross; j++) {
      var x = j * increment;
      var y = i * increment;
      var data = context.getImageData(x, y, 1, 1);
      var r = data.data[0];
      var g = data.data[1];
      var b = data.data[2];
      var rgbString = 'rgb(' + r + ', ' + g + ', ' + b + ')';
      dots.push({x: x * fullToThumbRatio, y: y * fullToThumbRatio, rgbString: rgbString});
    }
  }
  var $dotGrid = $('<div class="dot-grid" />')
    .attr({
      style: 'width: ' + this.width + 'px; height: ' + this.height + 'px;'
    }).appendTo(this.$wrapper);
  dots.forEach(function(d) {
    $('<div />').attr({
        class: 'dot',
        style: 'width: ' + dotSize + 'px; height: ' + dotSize + 'px;  left: ' + d.x + 'px; top: ' + d.y + 'px; background: ' + d.rgbString + '; '
    }).appendTo($dotGrid);
  });
}

LazyDotImage.prototype.prepDots = function(dotSize, margin) {
  //draw dots after thumb load
  var $downloadingImage = $("<img>");
  var self = this;
  $downloadingImage.on('load', function(){
    self.drawDots(dotSize, margin);
  });
  $downloadingImage.attr("src", this.$thumbImg.attr('src'));
}

  var lazyDotImages = [];
  var $imgLoadWrappers = $('.load-wrapper');
  var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d');

  $imgLoadWrappers.each(function(){
    var newImg = new LazyDotImage($(this), canvas, context);
    newImg.prepDots(18, 2);
    lazyDotImages.push( newImg );
  });

  function setAllSizes() {
    lazyDotImages.forEach(function(d){
      d.setWidthHeight();
    });
  }
  function checkAllImages() {
    var scrollTop = $(window).scrollTop();
    var height =  $(window).height();
    lazyDotImages.forEach(function(d){
      d.checkLoad(scrollTop, height);
    });
  }
  $(document).ready(checkAllImages);
  $(window).scroll(checkAllImages);
  $(window).resize(setAllSizes);

})(jQuery);
