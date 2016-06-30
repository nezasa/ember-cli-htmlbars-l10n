var franky = require('franky/lib/franky'),
  p = require('ember-cli-preprocess-registry/preprocessors'),
  preprocessJs = p.preprocessJs,
  buildApp = require('./buildApp'),
  processedTemplatesTreel10n = require('./processedTemplatesTreel10n'),
  mergeTrees = require('broccoli-merge-trees');

module.exports = function( options ) {
  var sourceTrees = [];
  var config = this._configTree();
  var app;
  var templates = this.processedTemplatesTreel10n.call(this, options);

  app = this.addonPreprocessTree('js', mergeTrees( [
    this._processedAppTree(),
    templates
  ].concat( sourceTrees ), {
    annotation: 'TreeMerger (preprocessedApp & templates)',
    overwrite : true
  } ) );

  var external = this._processedExternalTree();
  var preprocessedApp = preprocessJs( app, '/', this.name, {
    registry: this.registry
  } );

  var postprocessedApp = this.addonPostprocessTree( 'js', preprocessedApp );
  sourceTrees = sourceTrees.concat( [
    external,
    postprocessedApp,
    config
  ] );

  var emberCLITree = this._processedEmberCLITree();

  sourceTrees.push( emberCLITree );

  return mergeTrees( sourceTrees, {
    overwrite : true,
    annotation: 'TreeMerger (appAndDependencies)'
  } );
};
