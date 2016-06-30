var Funnel = require('broccoli-funnel'),
  franky = require('franky/lib/franky'),
  p = require('ember-cli-preprocess-registry/preprocessors'),
  preprocessTemplates = p.preprocessTemplates,
  buildApp = require('./buildApp'),
  mergeTrees = require('broccoli-merge-trees');

module.exports = function( options ) {
  var addonTrees = this.addonTreesFor( 'templates' );
  var mergedTrees = this.trees.templates ? addonTrees.concat( this.trees.templates ) : addonTrees;
  var mergedTemplates = mergeTrees( mergedTrees, {
    overwrite : true,
    annotation: 'TreeMerger (templates)'
  } );

  var standardTemplates = new Funnel( mergedTemplates, {
    srcDir    : '/',
    destDir   : this.name + '/templates',
    annotation: 'ProcessedTemplateTree'
  } );

  var podTemplates = new Funnel( this.trees.app, {
    include   : this._podTemplatePatterns(),
    exclude   : ['templates/**/*'],
    destDir   : this.name + '/',
    annotation: 'Funnel: Pod Templates'
  } );

  var templates = this.addonPreprocessTree( 'template', mergeTrees( [
    standardTemplates,
    podTemplates
  ], {
    annotation: 'addonPreprocessTree(template)',
    localesDir: options.l10n.localesDir,
    locale    : options.locale
  } ) );

  var tmpl = preprocessTemplates( templates, {
    registry  : this.registry,
    annotation: 'TreeMerger (pod & standard templates)'
  } );

  return this.addonPostprocessTree( 'template', tmpl );
};