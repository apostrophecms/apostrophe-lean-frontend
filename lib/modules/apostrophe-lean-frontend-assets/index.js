var _ = require('lodash');

module.exports = {
  improve: 'apostrophe-assets',

  construct: function(self, options) {

    // Override filterAssets so that "always" is treated as "user". This
    // maintains bc in the logged-in experience without pushing anything
    // unnecessary to the lean logged-out experience.

    self.filterAssets = function(assets, when, minifiable) {
      // Support older layouts
      if (!when) {
        throw new Error('You must specify the "when" argument (usually either anon or user)');
      }

      // Always stomp duplicates so that devs don't have to worry about whether
      // someone else pushed the same asset.
      var once = {};
      var results = _.filter(assets, function(asset) {
        if (minifiable !== undefined) {
          if (minifiable === true) {
            if (asset.minify === false) {
              return false;
            }
          }
          if (minifiable === false) {
            if (asset.minify !== false) {
              return false;
            }
          }
        }
        var relevant;
        if (asset.type !== 'script') {
          // Traditional logic
          relevant = (asset.when === 'always') || (when === 'all') || (asset.when === when);
        } else {
          // Override
          relevant = ((when === 'user') && (asset.when === 'always')) ||
            (asset.when === 'lean') ||
            // Has this ever been used?
            (when === 'all') ||
            (asset.when === when);
        }

        if (!relevant) {
          return false;
        }
        var key = asset.name + ':' + asset.fs + ':' + asset.web;
        if (once[key]) {
          return false;
        }
        once[key] = true;
        return true;
      });
      return results;
    };

  }
};
