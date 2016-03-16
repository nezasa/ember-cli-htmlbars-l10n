var Translator = require('./lib/main.js'),
    fs = require("fs"),
    readFile = function (path) {
      return fs.readFileSync(path, "utf8");
    };

module.exports = {
  name: 'ember-cli-l10n',

  options: {},

  getTranslationsByKey: function (locale) {
    if (!this.options.localesDir) {
      throw new TypeError("source dir with locales isn't defined, please define localesDir");
    }
    var file = this.options.localesDir + "/" + locale + ".json",
        jsonString,
        res = {};

    try {
      jsonString = readFile(file);
    } catch(err) {
      res = {};
    }

    if (jsonString) {
      res = JSON.parse(jsonString);
    }

    return res;
  },

  clear: function () {
    this.options = {};
  },

  config: function(params) {
      for(var key in params) {
        if (params.hasOwnProperty(key)) {
          this.options[key] = params[key];
        }
      }
  },

  getLocaleFromTree: function(tree) {
    var locale = null;

    if(tree.options && tree.options.locale) {
      locale = tree.options.locale;
    }

    return locale;
  },

  toTree: function(tree) {

    return Translator(
      tree,
      this.getTranslationsByKey(
        this.getLocaleFromTree(tree)
      ));
  },

  setupPreprocessorRegistry: function(type, registry) {
    registry.add('template', {
      name: 'ember-cli-l10n',
      ext: 'hbs',
      toTree: this.toTree
    });
  }
};