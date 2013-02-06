/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @altrugon
 * Licensed under the MIT license
 */

;(function ($, window, document, undefined) {

    // Create the defaults once
    var pluginName = "secuencia",
        defaults = {
          frameLoaded : 0,             // The loaded frame
          frames      : [],            // Array to hold image frames
          framesMoved : 0,             // The amount of frame that has been moved during the dragging action
          cursorStyle : 'move',        // Cursor change to 'move' by default to let the user know about the sequence behaviour
          direction   : 'horizontal',  // Dragging direction: horizontal or vertical
          dragging    : false,         // Flag to check if we are dragging inside the element
          fileExt     : '',            // File extension, ie: /this/is/myfile-0.png >> 'png'
          fileName    : '',            // File name, ie: /this/is/myfile-0.png >> 'myfile'
          filePath    : '',            // File path, ie: /this/is/myfile-0.png >> '/this/is/'
          listener    : undefined,     // The DOM element that will be listening for the events, will be set on the constructor
          nFrames     : 0,             // Number of frames
          speed       : 1              // Speed = 1 >> In one full drag we see a whole sequence. Increase or decrease speed as needed
        };

    // The actual plugin constructor
    function Secuencia(element, options) {
      this.element = element;

      // Due to the variables scope some defaults have to be set here
      var i, img;
      img = $(element).is("img") ? $(element).attr('src') : $(element).css('background-image');
      if (!img) {
        $.error( 'Secuencia was unable to find an image.' );
        return;
      }
      i = img.lastIndexOf(".") + 1;
      defaults.fileExt = img.substr(i);
      i = img.lastIndexOf("/") + 1;
      defaults.filePath = img.substr(0, i);
      defaults.fileName = img.substring(i, img.lastIndexOf("-"));

      defaults.listener = element;


      // The first object empty because we don't want to alter
      // the default options for future instances of the plugin
      this.options = $.extend({}, defaults, options) ;

      this._defaults = defaults;
      this._name = pluginName;

      this.init();
    }

    Secuencia.prototype.init = function () {
      this.loadFrames();

      // Access to the DOM element via the instance "this.element"
      // Access to the options via the instance "this.options"
      $(this.options.listener).bind('mouseenter.secuencia', this, mouseenter);
      $(this.options.listener).bind('mouseleave.secuencia', this, mouseleave);
      $(this.options.listener).bind('mousedown.secuencia', this, mousedown);
      $(this.options.listener).bind('mousemove.secuencia', this, mousemove);
      $(this.options.listener).bind('mouseup.secuencia', this, mouseup);

      // touch events only for iOS (ipad) - they disabled move events while the mouse is down in the new iOS.
      // kindof kills dragging.  and they gave us pageX & Y on the event so us retro people with only a primitive mouse
      // can pretend it's just a mouse event.
      $(this.options.listener).bind('touchstart.secuencia', this, mousedown);
      $(this.options.listener).bind('touchmove.secuencia', this, mousemove);
      $(this.options.listener).bind('touchend.secuencia', this, mouseup);
      $(this.options.listener).bind('touchcancel.secuencia', this, mouseleave);
    };

    /*
     * Image frames loader
     */
    Secuencia.prototype.loadFrames = function() {
      for(var i = 0; i < this.options.nFrames; i++) {
        // Images are into array but haven't been loaded yet since not request to the server has happened at this point. Is this right?
        this.options.frames[i] = $('<img>').attr('src', this.options.filePath + this.options.fileName + '-' + i + '.' + this.options.fileExt);
      }
    };

    /*
     * Handler for event: mousedown
     */
    function mousedown(event) {
      var s = event.data;
      s.options.dragging = true;

      // Get click's coordinates
      s.options.downX = event.pageX;
      s.options.downY = event.pageY;

      event.preventDefault();
      event.stopPropagation();
    }

    /*
     * Handler for event: mouseenter
     */
    function mouseenter(event) {
      var s = event.data;
      $(s.options.listener).css('cursor', s.options.cursorStyle);
    }

    /*
     * Handler for event: mouseleave
     */
    function mouseleave(event) {
      var s = event.data;
      s.options.dragging = false;
      s.options.framesMoved = 0;
      $(s.options.listener).css('cursor', 'pointer');
    }

    /*
     * Handler for event: mousemove
     */
    function mousemove(event) {
      var s = event.data;
      if(s.options.dragging) {
        var new_frame, dragged_pixels, final_speed;

        // if touchstart, move, etc. re-assign X+Y values
        if(event.originalEvent.touches && event.originalEvent.touches.length) {
          event.pageX = event.originalEvent.targetTouches[0].pageX;
          event.pageY = event.originalEvent.targetTouches[0].pageY;
        }

        if (s.options.direction === 'horizontal') {
          dragged_pixels = event.pageX - s.options.downX;
          final_speed = $(s.options.listener).width() / (s.options.nFrames * s.options.speed);
        }
        else if (s.options.direction === 'vertical') {
          dragged_pixels = event.pageY - s.options.downY;
          final_speed = $(s.options.listener).height() / (s.options.nFrames * s.options.speed);
        }

        dragged_pixels = (dragged_pixels < 0) ? dragged_pixels + final_speed : dragged_pixels; // compesate negative dragging
        new_frame = Math.floor(dragged_pixels / final_speed);

        if (new_frame != s.options.framesMoved) {
          s.options.framesMoved = new_frame;

          // Check move direction and sequence limits
          if (new_frame >= 0) {
            s.options.frameLoaded = ((s.options.frameLoaded + 1) < s.options.nFrames) ? (s.options.frameLoaded + 1) : 0;
          }
          else {
            s.options.frameLoaded = ((s.options.frameLoaded - 1) >= 0) ? (s.options.frameLoaded - 1) : (s.options.nFrames - 1);
          }
          $(s.element).attr('src', $(s.options.frames[s.options.frameLoaded]).attr('src'));
        }

        event.preventDefault();
        event.stopPropagation();
      }
    }

    /*
     * Handler for event: mouseup
     */
    function mouseup(event) {
      var s = event.data;
      s.options.dragging = false;
      s.options.framesMoved = 0;

      event.preventDefault();
      event.stopPropagation();
    }

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
      return this.each(function () {
        if (!$.data(this, "plugin_" + pluginName)) {
          $.data(this, "plugin_" + pluginName, new Secuencia(this, options));
        }
      });
    };

})(jQuery, window, document);
