module.exports = {
  improve: 'apostrophe-push',
  construct: function(self, options) {
    var superReqGetBrowserCalls = self.apos.app.request.getBrowserCalls;
    self.apos.app.request.getBrowserCalls = function() {
      var scene = this.scene || (this.user ? 'user' : 'anon');
      if (scene === 'anon') {
        return '';
      }
      return superReqGetBrowserCalls.apply(this, arguments);
    };
    var superBrowserCall = self.browserCall;
    self.browserCall = function(when, pattern /* , arg1, arg2... */) {
      if (arguments[0] === 'always') {
        arguments[0] = 'user';
      }
      return superBrowserCall.apply(self, arguments);
    };
  }
};
