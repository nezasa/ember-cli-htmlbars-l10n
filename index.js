var Translator = require('./lib/main.js'),
  buildLegacy = require('./lib/build.js'),
  buildNext = require('./lib/buildNext.js'),
  fs = require("fs"),
  options = {},
  readFile = function (path) {
    return fs.readFileSync(path, "utf8");
  },
  getLocaleFromTree = function(tree) {
    var locale = null;

    if(tree.options && tree.options.locale) {
      locale = tree.options.locale;
    }

    return locale;
  },
  config = function(params) {
    for(var key in params) {
      if (params.hasOwnProperty(key)) {
        options[key] = params[key];
      }
    }
  },
  getTranslationsByKey = function (locale) {
    if (!options.localesDir || typeof options.localesDir === "undefined") {
      throw new TypeError("source dir with locales isn't defined, please define localesDir");
    }
    var file = options.localesDir + "/" + locale + ".json",
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
  };

module.exports = {
  name: 'ember-cli-l10n',

  options: options,

  getTranslationsByKey: getTranslationsByKey,

  clear: function () {
    options = {};
  },

  // deprecated
  build: function(app) {
    var version = parseInt(app.project.pkg.devDependencies["ember-cli"].split(".").join(""), 10);
    if (version >= 243) {
      buildNext(app);
    } else {
      buildLegacy(app);
    }
  },

  config: config,

  getLocaleFromTree: getLocaleFromTree,

  toTree: function(tree) {
    var res;
    if (tree.options.locale && tree.options.localesDir) {
      config({
        localesDir: tree.options.localesDir
      });
      res = Translator(
        tree,
        getTranslationsByKey(
          getLocaleFromTree(tree)
        ));
    } else {
      res = tree;
    }
    return res;
  },

  setupPreprocessorRegistry: function(type, registry) {
    registry.add('template', {
      name: 'ember-cli-l10n',
      ext: 'hbs',
      toTree: this.toTree
    });
  }
};