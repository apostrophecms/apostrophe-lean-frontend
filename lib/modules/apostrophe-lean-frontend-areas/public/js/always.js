apos.define('apostrophe-areas', {

  construct: function(self, options) {

    // Even when logged in, stub out the traditional enablePlayers method,
    // in favor of the moog-free approach provided by apostrophe-lean-frontend
    self.enablePlayers = function() {};

  }
});
