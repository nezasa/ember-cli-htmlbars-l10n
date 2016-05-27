var EOL = require('os').EOL,
      Funnel = require('broccoli-funnel'),
      franky = require('franky/lib/franky'),
      p = require('ember-cli-preprocess-registry/preprocessors'),
      preprocessTemplates = p.preprocessTemplates,
      preprocessJs = p.preprocessJs,
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
    var that = this;
    this.options.l10n.locales.forEach( function( locale ) {
      targets.push( that.concatFiles( mergeTrees( [
        that.appAndDependenciesl10n( franky.beget( that.options, {locale: locale} ) ),
        that._processedEmberCLITree()
      ], {
        annotation: 'TreeMerger (appJS  & processedEmberCLITree)',
        overwrite : true
      } ), {
        inputFiles : [that.name + '/**/*.js'],
        headerFiles: [
          'vendor/ember-cli/app-prefix.js'
        ],
        footerFiles: [
          'vendor/ember-cli/app-suffix.js',
          'vendor/ember-cli/app-config.js',
          'vendor/ember-cli/app-boot.js'
        ],
        outputFile : "/assets/" + that.name + "_" + locale + ".js",
        annotation : 'Concat: App'
      } ) );
    } );

    return mergeTrees( targets, {
      annotation: 'TreeMerger (vendor & appJS)'
    } );

  };

  app.appAndDependenciesl10n = function( options ) {
    var sourceTrees = [];
    var config = this._configTree();
    var app;
    var templates = this.processedTemplatesTreel10n( options );

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

  app.processedTemplatesTreel10n = function( options ) {
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
};