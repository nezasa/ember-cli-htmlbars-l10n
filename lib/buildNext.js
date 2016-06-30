var EOL = require('os').EOL,
  Funnel = require('broccoli-funnel'),
  franky = require('franky/lib/franky'),
  p = require('ember-cli-preprocess-registry/preprocessors'),
  buildApp = require('./buildApp'),
  mergeTrees = require('broccoli-merge-trees'),
  appAndDependenciesl10n = require('./appAndDependenciesl10n'),
  processedTemplatesTreel10n = require('./processedTemplatesTreel10n');

module.exports = function(app) {
  // customize javascript build
  app.javascript = function() {

    var deprecate           = this.project.ui.writeDeprecateLine.bind(this.project.ui);
    var applicationJs       = this.appAndDependencies();
    var appOutputPath       = this.options.outputPaths.app.js;
    var appJs               = applicationJs;

    // Note: If ember-cli-babel is installed we have already performed the transpilation at this point
    if (!this._addonInstalled('ember-cli-babel')) {
      appJs = new Babel(
        new Funnel(applicationJs, {
          include: [escapeRegExp(this.name + '/') + '**/*.js'],
          annotation: 'Funnel: App JS Files'
        }),
        merge(this._prunedBabelOptions())
      );
    }

    appJs = mergeTrees([
      appJs,
      this._processedEmberCLITree()
    ], {
      annotation: 'TreeMerger (appJS  & processedEmberCLITree)',
      overwrite: true
    });

    if (this.legacyFilesToAppend.length > 0) {
      deprecate('Usage of EmberApp.legacyFilesToAppend is deprecated. Please use EmberApp.import instead for the following files: \'' + this.legacyFilesToAppend.join('\', \'') + '\'');
      this.legacyFilesToAppend.forEach(function(legacyFile) {
        this.import(legacyFile);
      }.bind(this));
    }

    this.import('vendor/ember-cli/vendor-prefix.js', {prepend: true});
    this.import('vendor/addons.js');
    this.import('vendor/ember-cli/vendor-suffix.js');

    var vendorFiles = [];
    for (var outputFile in this._scriptOutputFiles) {
      var inputFiles = this._scriptOutputFiles[outputFile];

      vendorFiles.push(
        this.concatFiles(applicationJs, {
          inputFiles: inputFiles,
          outputFile: outputFile,
          separator: EOL + ';',
          annotation: 'Concat: Vendor ' + outputFile
        })
      );
    }
    var targets = vendorFiles.concat(appJs);

    buildApp.call(this, targets);

    return mergeTrees(targets, {
      annotation: 'TreeMerger (vendor & appJS)'
    });
  };

  app.appAndDependenciesl10n = appAndDependenciesl10n;
  app.processedTemplatesTreel10n = processedTemplatesTreel10n;
};