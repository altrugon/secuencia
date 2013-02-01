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
          frames      : 0,             // Number of frames
          cursorStyle : 'move',        // Cursor change to 'move' by default to let the user know about the sequence behaviour
          direction   : 'horizontal',  // Dragging direction: horizontal, vertical, right, left, up, or down
          dragging    : false,         // Flag to check if we are dragging inside the element
          fileExt     : '',            // File extension, ie: /this/is/myfile-0.png >> 'png'
          fileName    : '',            // File name, ie: /this/is/myfile-0.png >> 'myfile'
          filePath    : '',            // File path, ie: /this/is/myfile-0.png >> '/this/is/'
          listener    : undefined      // The DOM element that will be listening for the events, will be set on the constructor
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
      // Access to the DOM element via the instance "this.element"
      // Access to the options via the instance "this.options"
      $(this.options.listener).bind('hover.secuencia', this.options, mouseenter, mouseleave);
      $(this.options.listener).bind('mousedown.secuencia', this.options, mousedown);
      $(this.options.listener).bind('mousemove.secuencia', this.options, mousemove);
      $(this.options.listener).bind('mouseup.secuencia', this.options, mouseup);

      // touch events only for iOS (ipad) - they disabled move events while the mouse is down in the new iOS.
      // kindof kills dragging.  and they gave us pageX & Y on the event so us retro people with only a primitive mouse
      // can pretend it's just a mouse event.
      $(this.options.listener).bind('touchstart.secuencia', this.options, mousedown);
      $(this.options.listener).bind('touchmove.secuencia', this.options, mousemove);
      $(this.options.listener).bind('touchend.secuencia', this.options, mouseup);
      $(this.options.listener).bind('touchcancel.secuencia', this.options, mouseout);
    };

    /*
     * Handler for event: mousedown
     */
    function mousedown(event) {
      event.data.dragging = true;

      event.preventDefault();
      event.stopPropagation();
    };

    /*
     * Handler for event: mouseenter
     */
    function mouseenter(event) {
      $(event.data.listener).css('cursor', event.data.cursorStyle);
    };

    /*
     * Handler for event: mouseleave
     */
    function mouseleave(event) {
      $(event.data.listener).css('cursor', 'pointer');
    };

    /*
     * Handler for event: mousemove
     */
    function mousemove(event) {
      if(event.data.dragging) {
        // if touchstart, move, etc. re-assign X+Y values
        if(event.originalEvent.touches && event.originalEvent.touches.length) {
            event.pageX = event.originalEvent.targetTouches[0].pageX;
            event.pageY = event.originalEvent.targetTouches[0].pageY;
        }

        event.preventDefault();
        event.stopPropagation();
      }
    };

    /*
     * Handler for event: mouseup
     */
    function mouseup(event) {
      event.data.dragging = false;

      event.preventDefault();
      event.stopPropagation();
    };

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
