var Translator = require('./lib/main.js'),
    fs = require("fs"),
    readFile = function (path) {
      return fs.readFileSync(path, "utf8");
    };

module.exports = {
  name: 'ember-cli-l10n',

  setupPreprocessorRegistry: function(type, registry) {
    registry.add('template', {
      name: 'ember-cli-l10n',
      ext: 'hbs',
      toTree: function(tree) {
        var res;
        var locale = tree.options && tree.options.locale && tree.options.localesDir ? tree.options.locale : null;
        // read files with translations
        if (locale) {
          var json = readFile(tree.options.localesDir + "/" + locale + ".json");
          res = Translator(tree, JSON.parse(json));
        } else {
          res = Translator(tree);
        }

        return res;
      }
    });
  }
};