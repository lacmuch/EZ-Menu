/**
 *  EZ Menu
 *  Create a HTML navigation menu and sub-menus from JSON with ease.
 *
 *  Copyright 2012-2015, Marc S. Brooks (https://mbrooks.info)
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  Dependencies:
 *    jquery.js
 */

if (!window.jQuery || (window.jQuery && parseInt(window.jQuery.fn.jquery.replace('.', '')) < parseInt('1.8.3'.replace('.', '')))) {
  throw new Error('EZ-Menu requires jQuery 1.8.3 or greater.');
}

(function($) {

  /**
   * @namespace EZMenu
   */
  var methods = {

    /**
     * Create new instance of EZ-Menu
     *
     * @memberof EZMenu
     * @method init
     *
     * @param {Object} settings
     * @param {Object} config
     *
     * @returns {Object} jQuery object
     */
    "init": function(settings, config) {
      var $this = $(this),
          data  = $this.data();

      // Default settings
      var defaults = {
        showEasing: 'linear',
        hideEasing: 'linear',
        showSpeed:  'fast',
        hideSpeed:  'fast',
        click2open: false,
        responsive: false
      };

      if (arguments.length > 1) {
        $.extend(defaults, settings);
      }
      else {
        config = settings;
      }

      if ( $.isEmptyObject(data) ) {
        $this.data({
          settings: defaults,
          config:   config
        });
      }

      return $this.append(
        $this.EZMenu('_createNavMenu')
      );
    },

    /**
     * Perform cleanup
     *
     * @memberof EZMenu
     * @method destroy
     */
    "destroy": function() {
      $(this).removeData();
    },

    /**
     * Create the navigation menu elements.
     *
     * @memberof EZMenu
     * @method _createNavMenu
     * @private
     *
     * @returns {Object} jQuery object
     */
    "_createNavMenu": function() {
      var $this = $(this),
          data  = $this.data();

      // Generate as unordered list
      var list = $('<ul></ul>')
        .addClass('ez_menu');

      // Responsive layout?
      if (data.settings.responsive) {
        list.addClass('media');
      }

      for (var i = 0; i < data.config.length; i++) {
        var menu = data.config[i],
            item = $('<li></li>'),
            link = $('<a></a>')
              .append(menu.name);

        var href = window.location,
            curr = href.protocol + '//' + href.host + href.pathname;

        // Highlight the selected option
        if (href.pathname == menu.url || curr == menu.url) {
          item.addClass('menu_hover_on')
            .attr('target', true);
        }
        else {
          item.addClass('menu_hover_off');
        }

        // Bind hover events
        item.on('mouseover touchenter', function() {
          var $this = $(this);

          if (!$this.prop('visible') && !$this.attr('target')) {
            $this.removeClass('menu_hover_off').addClass('menu_hover_on');
          }
        });

        list.on('mouseout touchend',function() {
          var $this = $(this).children('li');

          $this.removeClass('menu_hover_on').addClass('menu_hover_off');
        });

        // Bind anchor link event
        if (menu.url) {
          link.attr({
            target: (menu.target) ? menu.target : '_self',
            href:   menu.url
          });

          link.on('click', function(event) {
            if (typeof window.ontouchstart !== 'undefined') {
              event.preventDefault();
            }
          });
        }

        link.data('menu', menu);
        if (menu.onclick) {
            link.on('click',menu.onclick);
        } else if ($this.data().settings.onclick) {
            link.on('click',$this.data().settings.onclick);
        }

        // Add custom classes
        if (menu.classname) {
          link.addClass(menu.classname);
        }

        // Create the sub-menu
        if (menu.options) {
          var submenu = $this.EZMenu('_createMenuOpts', menu.options);

          item.append(submenu);

          $this.EZMenu('_bindMenuEvents', item, submenu);
        }

        item.prepend(link);
        list.append(item);
      }

      return list;
    },

    /**
     * Create the menu option elements.
     *
     * @memberof EZMenu
     * @method _createMenuOpts
     * @private
     *
     * @param {Object} config
     *
     * @returns {Object} jQuery object
     */
    "_createMenuOpts": function(config) {
      var $this = $(this);

      // Generate as unordered list
      var list = $('<ul></ul>')
        .addClass('menu_list');

      for (var i = 0; i < config.length; i++) {
        var menu = config[i],
            item = $('<li></li>'),
            link = $('<a></a>')
              .append(menu.name);

        // Bind anchor link event
        if (menu.url) {
          link.attr({
            target: (menu.target) ? menu.target : '_self',
            href:   menu.url
          });

          link.on('click', function(event) {
            if (typeof window.ontouchstart !== 'undefined') {
              event.preventDefault();
            }
          });
        }

        item.data('menu', menu);
        if (menu.onclick) {
            item.on('click',menu.onclick);
        } else if ($this.data().settings.onclick) {
            item.on('click',$this.data().settings.onclick);
        }

        // Add custom classes
        if (menu.classname) {
          link.addClass(menu.classname);
        }

        // Create the sub-menu
        if (menu.options) {
          var submenu = $this.EZMenu('_createMenuOpts', menu.options);

          item.addClass('submenu').append(submenu);

          $this.EZMenu('_bindMenuEvents', item, submenu);
        }

        item.prepend(link);
        if (menu.icon) item.prepend('<span class="'+menu.icon+'"/>');
        list.append(item);
      }

      return list;
    },

    /**
     * Attach hide/unhide events.
     *
     * @memberof EZMenu
     * @method _bindMenuEvents
     * @private
     *
     * @param {Object} item
     * @param {Object} submenu
     */
    "_bindMenuEvents": function(item, submenu) {
      var $this = $(this),
          data  = $this.data();

      var action = (data.settings.click2open && !data.settings.responsive) ? 'click' : 'mouseenter touchenter',
          active = null,
          opened = null;

      item.on(action, submenu, function(event) {
        event.stopPropagation();

        var elm = $(this),
            obj = event.data;

        // Hide menu sub-menu
        if (elm.prop('visible')) {
          if ((!active || !opened) || $(elm).find('.ui-sortable-helper').length > 0) return;

          obj.hide(data.settings.hideSpeed, data.settings.hideEasing, function() {

            elm.removeClass('submenu_hover_on').addClass('submenu_hover_off')
              .removeProp('visible');

            active = null;
            opened = null;
          });
        }

        // Show select menu items
        else {
          if (active || opened) return;

          elm.removeClass('submenu_hover_off').addClass('submenu_hover_on')
            .prop('visible', true);

          obj.show(data.settings.showSpeed, data.settings.showEasing, function() {
            opened = true;
          });

          active = true;
        }
      });

      if (action != 'mouseenter touchenter') return;

      item.on('mouseleave touchleave', data.settings, function() {
        if ((!active && !opened) || $(item).find('.ui-sortable-helper').length > 0) return;

        // Close all submenus
        item.each(function() {
          var elm = $(this);

          var events = $._data(elm[0], 'events');
          if (events) {
            opened = true;

            elm.trigger('mouseenter');
          }
        });
      });
    }
  };

  $.fn.EZMenu = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    else
    if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    }
    else {
      $.error('Method ' +  method + ' does not exist in jQuery.EZMenu');
    }
  };
})(jQuery);
