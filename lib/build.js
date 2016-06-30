var EOL = require('os').EOL,
    franky = require('franky/lib/franky'),
    appAndDependenciesl10n = require('./appAndDependenciesl10n'),
    processedTemplatesTreel10n = require('./processedTemplatesTreel10n'),
    buildApp = require('./buildApp'),
    mergeTrees = require('broccoli-merge-trees');

module.exports = function(app) {

  // customize javascript build
  app.javascript = function() {

    var applicationJs = this.appAndDependencies();
    var legacyFilesToAppend = this.legacyFilesToAppend;
    this.options.outputPaths.assets = "/assets";

    var inputFiles = ['vendor/ember-cli/vendor-prefix.js']
      .concat(legacyFilesToAppend)
      .concat('vendor/addons.js')
      .concat('vendor/ember-cli/vendor-suffix.js');

    var vendor = this.concatFiles( applicationJs, {
      inputFiles: inputFiles,
      outputFile: this.options.outputPaths.vendor.js,
      separator : EOL + ';',
      annotation: 'Concat: Vendor'
    } );

    var targets = [
      vendor
    ];

    buildApp.call(this, targets);

    return mergeTrees( targets, {
      annotation: 'TreeMerger (vendor & appJS)'
    } );

  };

  app.appAndDependenciesl10n = appAndDependenciesl10n;
  app.processedTemplatesTreel10n = processedTemplatesTreel10n;
};