// Adds minimal services to the apos object replacing
// functionality widget players can't live without, 
// and provides the `runPlayers` method to run all players
// once if not run previously.
//
// Also schedules that method to run automatically when
// the DOM is ready.
//
// Adds apos to window if not already present.

(function() {

  if (!window.apos) {
    window.apos = {};
  }
  var apos = window.apos;

  // Make a POST JSON call to the given URI. The object `data` is transferred
  // as JSON. On success the response is delivered to the callback as
  // `(null, response)`, following the Node.js convention.
  // On failure the error is delivered as `(err)`. Specifically the
  // error will be the event object associated with the error.

  apos.post = function(uri, data, callback) {
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
    xmlhttp.open("POST", uri);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(JSON.stringify(data));
    monitor(xmlhttp, callback);
  };

  // Like `apos.post` but uses a GET request, with the properties of `data`
  // added with query string encoding. Currently no support for nested properties
  // in `data`; intended for simple cases where you actually want the browser
  // to cache. Like `jsonCall`, it invokes the callback Node.js style,
  // with an error if any, followed by the response as parsed JSON.

  apos.get = function(uri, data, callback) {
    uri += '?';
    var keys = Object.keys(data);
    var i;
    for (i = 0; (i < keys.length); i++) {
      if (i > 0) {
        uri += '&';
      }
      uri += encodeURIComponent(keys[i]) + '=' + encodeURIComponent(data[keys[i]]);
    }
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
    xmlhttp.open("GET", uri);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(JSON.stringify(data));
    monitor(xmlhttp, callback);
  };

  // Implementation detail of `apos.post` and `apos.get`
  function monitor(xmlhttp, callback) {
    xmlhttp.addEventListener("load", function() {
      var data;
      try {
        data = JSON.parse(this.responseText);
      } catch (e) {
        return callback(e);
      }
      return callback(null, data);
    });
    xmlhttp.addEventListener('abort', function(evt) {
      return callback(evt);
    });
    xmlhttp.addEventListener('error', function(evt) {
      return callback(evt);
    });
  };

  // Remove a CSS class, if present.
  // http://youmightnotneedjquery.com/

  apos.removeClass = function(el, className) {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  };

  // Add a CSS class, if missing.
  // http://youmightnotneedjquery.com/

  apos.addClass = function(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += ' ' + className;
    }
  };

  // Like Object.assign. Uses Object.assign where available.
  // (Takes us back to IE9)

  apos.assign = function(obj1, obj2 /*,  obj3... */) {
    if (Object.assign) {
      return Object.assign.apply(Object, arguments);
    }
    var i, j, keys, key;
    for (i = 1; (i < arguments.length); i++) {
      keys = Object.keys(arguments[i]);
      for (j = 0; (j < keys.length); k++) {
        key = keys[j];
        obj1[key] = arguments[i][key];
      }
    }
    return obj1;
  };

  // Map of widget players. Adding one is as simple as:
  // window.apos.widgetPlayers['widget-name'] = function(el, data, options) {}
  //
  // Use the widget's name, like "apostrophe-images", NOT the name of its module.
  //
  // Your player receives the DOM element of the widget and the
  // pre-parsed `data` and `options` objects associated with it,
  // as objects. el is NOT a jQuery object, because jQuery is not pushed
  // (we push no libraries in the lean world).
  //
  // Your player should add any needed javascript effects to
  // THAT ONE WIDGET and NO OTHER. Don't worry about finding the
  // others, we will do that for you and we guarantee only one call per widget.

  apos.widgetPlayers = {};

  // On DOMready, similar to jQuery. Always defers at least to next tick.
  // http://youmightnotneedjquery.com/

  apos.onReady = function(fn) {
    if (document.readyState !== 'loading') {
      setTimeout(fn, 0);
    } else if (document.addEventListener) {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      document.attachEvent('onreadystatechange', function() {
        if (document.readyState !== 'loading') {
          fn();
        }
      });
    }
  };

  // Run all the players that haven't been run. Invoked for you at DOMready
  // time. You may also invoke it if you just AJAXed in some content and
  // have reason to suspect there could be widgets in there. You may pass:
  //
  // * Nothing at all — entire document is searched for new widgets to enhance, or
  // * A DOM element that contains widgets — searched for new widgets to enhance.
  //
  // To register a widget player for the `apostrophe-images` widget, write:
  //
  // `apos.widgetPlayers['apostrophe-images'] = function(el, data, options) { ... }`
  //
  // `el` is a DOM element, not a jQuery object. Otherwise identical to
  // traditional Apostrophe widget players. `data` contains the properties
  // of the widget itself, `options` contains the options that were
  // passed to it at the area or singleton level.
  //
  // Your player is guaranteed to run only once per widget. Hint:
  // DON'T try to find all the widgets. DO just enhance `el`.
  // This is a computer science principle known as "separation of concerns."

  apos.runPlayers = function(el) {
    var widgets = (el || document).querySelectorAll('[data-apos-widget]');
    var i;
    if (el && el.getAttribute('data-apos-widget')) {
      // el is itself a widget. Might still contain some too
      play(el);
    }
    for (i = 0; (i < widgets.length); i++) {
      play(widgets[i]);
    }

    function play(widget) {
      if (widget.getAttribute('data-apos-played')) {
        return;
      }
      var data = JSON.parse(widget.getAttribute('data'));
      var options = JSON.parse(widget.getAttribute('data-options'));
      widget.setAttribute('data-apos-played', '1');
      var player = apos.widgetPlayers[data.type];
      if (!player) {
        return;
      }    
      player(widget, data, options);
    }
  };

  // Schedule runPlayers to run as soon as the document is ready.
  // You can run it again with apos.runPlayers() if you AJAX-load some widgets.

  apos.onReady(function() {
    // Indirection so you can override `apos.runPlayers` first if you want to for some reason
    apos.runPlayers();
    // In the event (cough) that we're in the full-blown Apostrophe editing world,
    // we also need to run widget players when content is edited
  });

  if (apos.on) {
    apos.on('enhance', function($el) {
      apos.runPlayers($el[0]);
    });
  }

})();



