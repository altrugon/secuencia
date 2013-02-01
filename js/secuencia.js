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
          listener    : undefined      // The DOM element that will be listening for the events, will be set on the constructor
        };

    // The actual plugin constructor
    function Secuencia(element, options) {
      this.element = element;

      // By default the listeners is the actual element
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
      $(this.options.listener).bind('mousemove.secuencia', this.options, this.move);
      $(this.options.listener).bind('mouseout.secuencia', this.options, this.out);
      $(this.options.listener).bind('mouseup.secuencia', this.options, this.up);
    };

    Secuencia.prototype.move = function (event) {
      $(event.data.listener).css('cursor', event.data.cursorStyle);
    };

    Secuencia.prototype.out = function (event) {
    };

    Secuencia.prototype.up = function (event) {
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
