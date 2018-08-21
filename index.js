var modules = [
  'apostrophe-lean-frontend-assets',
  'apostrophe-lean-frontend-areas',
  'apostrophe-lean-frontend-push'
];

module.exports = {
  moogBundle: {
    modules: modules,
    directory: 'lib/modules'
  },
  afterConstruct: function(self) {
    self.pushAssets();
  },
  construct: function(self, options) {
    // TODO: not really interesting until we shut off all the OTHER js
    self.pushAssets = function() {
      self.pushAsset('script', 'apos', { when: 'lean' });
      if (self.options.widgets['apostrophe-video']) {
        self.pushAsset('script', 'video', { when: 'lean' });
      }
    };
  }
};
