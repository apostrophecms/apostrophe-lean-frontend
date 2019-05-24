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
        if (asset.type !== 'script' && asset.type !== 'stylesheet') {
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

    /*
    Override the pushConfigured so that self configured assets are always servered by the lean front-end, unless specified otherwise
    */
    self.pushConfigured = function() {
      _.each(self.options.stylesheets || [], function(item) {
        self.pushAsset('stylesheet', item.name, self.setWhenIfNotConfigured(item, 'lean'));
      });
      _.each(self.options.scripts || [], function(item) {
        self.pushAsset('script', item.name, self.setWhenIfNotConfigured(item, 'lean'));
      });
    };

    /*
    Function for checking if 'when' attributed is set for an asset item, if not, set it to @defaultWhen
    */
    self.setWhenIfNotConfigured = function(item, defaultWhen){
      if (!('when' in item)) {
        item['when'] = defaultWhen;
      }
      return item;
    }
  }
};
