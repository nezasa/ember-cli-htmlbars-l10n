var builder;

describe("ember-cli-l10n", function() {
  var translator = require('..');
  var fs = require('fs');
  var path = require('path');
  var broccoli = require('broccoli');
  var mkdirp = require('mkdirp');

  var fixtures = path.join(__dirname, 'fixtures');

  afterEach(function() {
    if (builder) {
      return builder.cleanup();
    }
  });

  it("generates expected output", function() {
    var tree = new translator(fixtures);
    builder = new broccoli.Builder(tree);

  });

});
