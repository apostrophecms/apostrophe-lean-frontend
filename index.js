module.exports = {
  afterConstruct: function(self) {
    self.pushAssets();
  },
  construct: function(self, options) {
    // TODO: not really interesting until we shut off all the OTHER js
    self.pushAssets = function() {
      self.pushAsset('script', 'apos');
      if (self.options.widgets['apostrophe-video']) {
        self.pushAsset('script', 'video');
      }
    };
  }
};
