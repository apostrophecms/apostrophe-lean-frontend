## This package is deprecated for new projects

Although this package **still works** for backwards compatibility, its functionality has been **merged into the core of Apostrophe** as of version 2.91.0. You should [follow the official lean frontend HOWTO](https://docs.apostrophecms.org/apostrophe/tutorials/howtos/lean-frontend-assets) rather than using this module.


Future, as-yet-unreleased Apostrophe modules might not support operation with this legacy module present.

This module was an important part of Apostrophe's evolution and we thank you for using it and giving your feedback.

## How to migrate away from this module

* Remove this module and do not enable it in `app.js`.
* Turn on the `lean: true` option for the `apostrophe-assets` module.
* Change all `apos.lean` method calls to `apos.utils`. The method names are the same.
* Change all `apos.lean.widgetPlayers` assignments to `apos.utils.widgetPlayers`.
* If you want the lean player for `apostrophe-video-widgets`, set `player: true` in the configuration of the `apostrophe-video-widgets` module. Note this is different from how it was done in `apostrophe-lean-frontend`.

## What does it do?

A leaner frontend js and css world for [ApostropheCMS](https://apostrophecms.org) 2.x. No jQuery, no lodash, no async module, etc. You still get a way to write widget players, tiny workarounds for some of the silliest gaps in older browsers, and some players for standard widgets that are pushed to the browser only if you enable them.

This module is designed to be feasible for use back to the IE9 compatibility level.

## Usage

```
npm install apostrophe-lean-frontend
```

```javascript
// inside app.js
modules: {
  'apostrophe-lean-frontend': {
    widgets: {
      // Otherwise no video player is pushed
      'apostrophe-video': true
    }
  }
}
```

## What doesn't it do?

* When a user is logged in, they still receive all of the usual frontend JavaScript, to enable editing experiences. However, the traditional widget players are disabled in favor of the lean ones, to prevent conflict and provide a WYSIWYG experience.

* The `req.browserCall` and `apos.push.browserCall` methods have no effect on the logged-out, "lean" experience. If you need to pass data from the server to the browser, use the `json` Nunjucks filter inside your page templates or layouts, like this:

```
<script>
window.tags = {{ data.page.tags | json }};
</script>
```

## How to use the provided widget players

The video widget player (currently the only one) will "just work" when this module is enabled and the widget player is enabled via the appropriate option (see above).

## What you get in the browser

Logged in, you still get everything, so the editing experience works without change. One big exception: you don't get the standard, jQuery-based widget players, because that would just give you a false impression they are going to work when you log out. Instead, you get the same lean players you get when logged out.

> Every method of `apos.lean` described below is available whether logged in or not.

When you are logged out, you get a tiny `window.apos` object with key properties like `prefix` and `csrfCookieName`, plus the `lean` object which offers the methods and features below... and that's all.

### `apos.lean.post(uri, data, callback)`

Sends `data` to URI as a JSON-format request body in a POST request (note: not URL-encoded). The callback is node-style: it receives `(err, response)`. If there is no error, `response` is pre-parsed JSON data. Respects `apos.prefix` and sends the CSRF token.

### `apos.lean.get(uri, data, callback)`

Sends `data` to URI as a query string. Nested objects and arrays are not supported; see `apos.post`. This method should be reserved for simple, intentionally cache-friendly requests. The callback is node-style: it receives `(err, response)`. If there is no error, `response` is pre-parsed JSON data. Respects `apos.prefix`.

### `apos.lean.removeClass(el, className)`

Removes the specified class from the specified DOM element (NOT a jQuery object).

### `apos.lean.addClass(el, className)`

Adds the specified class to the specified DOM element (NOT a jQuery object).

### `apos.lean.closest(el, selector)`

A wrapper for the native closest() method of DOM elements,
where available, otherwise a polyfill for IE9+. Returns the
closest ancestor of el that matches `selector`, where
`el` itself is considered the closest possible ancestor and will
be returned if it matches `selector`.

### `apos.lean.assign(obj1, obj2 /* , obj3... */)`

A wrapper for `Object.assign`, where available; otherwise provides a basic polyfill. Properties of `obj2` are copied to `obj1`, then properties of `obj3`, and so on. `obj1` is returned.

### `apos.lean.onReady(fn)`

Invokes the specified function when the DOM is ready, but no sooner than next tick. A replacement for jQuery's `ready` event. However, always register widget players rather than using this method yourself to enhance widgets. Otherwise they will not be enhanced when the user first adds them to the page, which looks unprofessional.

### `apos.lean.runPlayers(el)`

Runs all widget players found in `el`, or in the document if `el` is not given. `el` may also be an individual widget.

Widget players are guaranteed to never run twice, so you may safely call this more than once.

See below for how to register a widget player for your widget type.

## How to register a widget player

In your front-end JavaScript, simply write:

```javascript
apos.lean.widgetPlayers['apostrophe-video'] = function(el, data, options) {
  // Utilize the provided `data` (properties of the widget)
  // and `options` (options passed to the singleton or area for
  // this widget) to enhance `el`, a DOM element representing the widget
};
```

Note that we register the widget's type name, i.e. `apostrophe-video`, NOT the module name.

For a complete example, see `video.js` in this module.

## How do I push my assets to the browser? "always" doesn't work!

For backwards compatibility, this module patches "always" to load only when a user is logged in.

Instead, use `when: lean` when pushing an asset in your module:

```javascript
module.exports = {
  construct: function(self, options) {
    self.pushAsset('script', 'my-widget-player', { when: 'lean' });
  }
}
```
## Pushing preconfigured assets from apostrophe-assets

As of version 2.1.0, this just works. This module pushes js and css assets specified in `apostrophe-assets/index.js` as if `when: 'lean'` is set, so that these assets are available to everyone, unless `when` is explicitly set to a different value. Note that for legacy reasons, `when: 'always'` *does not* push assets to everyone in the presence of this module.

> Important: if your `site.less` refers to LESS variables that come from Apostrophe, i.e. those with an `@apos` prefix, your LESS will not compile successfully since these will not be present.

## What's it weigh on the front end?

Total size is currently less than 10K BEFORE minification, which of course makes it even smaller. And that's with the video widget player, which you don't have to enable if you don't want to.

Take into account gzip encoding and... yes, it deserves its name. There may of course be some limited growth, but we are committed to keeping it lean and pushing various widget players only if you enable that.

### Tips

**"What about `_.each()`?"** Arrays have had a native `.forEach()` method since IE9. If you need to iterate over object properties, use `Object.keys(yourObjectHere)` to get an array of keys, then iterate over those with `.forEach()`.

**"What about $('.some-class-here')?"** Use `document.querySelectorAll('.some-class-here')`. You can also call that method on an individual DOM element to get the effect of jQuery's `find()` method.

### More resources for success

Struggling to adapt existing jQuery-based code to "vanilla JavaScript?" Check out [You Might Not Need jQuery](http://youmightnotneedjquery.com/).
