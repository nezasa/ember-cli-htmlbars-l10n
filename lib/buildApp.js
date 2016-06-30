var franky = require('franky/lib/franky'),
  mergeTrees = require('broccoli-merge-trees');

module.exports = function(targets) {
  var that = this;
  this.options.l10n.locales.forEach( function( locale ) {
    targets.push(that.concatFiles(mergeTrees([
      that.appAndDependenciesl10n(franky.beget(that.options, {locale: locale})),
      that._processedEmberCLITree()
    ], {
      annotation: 'TreeMerger (appJS  & processedEmberCLITree)',
      overwrite: true
    }), {
      inputFiles: [that.name + '/**/*.js'],
      headerFiles: [
        'vendor/ember-cli/app-prefix.js'
      ],
      footerFiles: [
        'vendor/ember-cli/app-suffix.js',
        'vendor/ember-cli/app-config.js',
        'vendor/ember-cli/app-boot.js'
      ],
      outputFile: "/assets/" + that.name + "_" + locale + ".js",
      annotation: 'Concat: App'
    }));
  })
};