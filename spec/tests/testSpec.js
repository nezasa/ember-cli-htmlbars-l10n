/* global describe, expect, require, beforeEach, it, __dirname */
describe("ember-cli-htmlbars-l10n", function() {
  var translator = require('../..');
  var Processor = require('../../lib/main');
  var fs = require('fs');
  var path = require('path');

  beforeEach(function() {
    translator.config({
      localesDir: "spec/fixtures/locales"
    });
    var tree = path.join(__dirname, 'fixtures/templates/!*.hbs');

    this.processorEN = new Processor(tree,translator.getTranslationsByKey("en2"));

  });

  it("reads locales folder", function() {
    expect(translator.getTranslationsByKey("en")).toEqual(
      { basewords: { hello: 'Hello', helloName: 'Hello {0} {1}' } }
    );
    expect(translator.getTranslationsByKey("de")).toEqual(
      { basewords: { hello: 'Hallo', helloName: 'Hallo {0} {1}' } }
    );
  });

  it("returns empty object for absent locale", function () {
    expect(translator.getTranslationsByKey("aa")).toEqual({});
  });

  it("returns empty object for wrong localesDir folder", function () {
    translator.config({
      localesDir: "spec/fixtures/localesWrong"
    });
    expect(translator.getTranslationsByKey("aa")).toEqual({});
  });

  it("throws exception if localesDir is not defined", function() {
    translator.clear();
    var testFunc = function() {
      return translator.getTranslationsByKey("aa");
    };
    expect(testFunc).toThrowError(TypeError, "source dir with locales isn't defined, please define localesDir");
  });

  it('translates simple phrases by path in json', function() {
    var tree = path.join(__dirname, 'fixtures/templates/!*.hbs'),
      processorEN = new Processor(tree,translator.getTranslationsByKey("en")),
      processorDE = new Processor(tree,translator.getTranslationsByKey("de")),
      processorRU = new Processor(tree,translator.getTranslationsByKey("ru")),
      processorEN2 = new Processor(tree,translator.getTranslationsByKey("en2"));

    expect(processorEN.processString(
      "{{t 'basewords.hello'}}"
    )).toBe("Hello");

    expect(processorDE.processString(
      '{{t "basewords.hello"}}'
    )).toBe("Hallo");

    expect(processorRU.processString(
      "{{t 'basewords.hello'}}"
    )).toBe("Привет");

    expect(processorEN2.processString(
      "{{t 'one.two.three.four'}}"
    )).toBe("oops");

  });

  it("returns empty string if key isn't found in json", function() {
    var tree = path.join(__dirname, 'fixtures/templates/!*.hbs'),
      processorEN = new Processor(tree,translator.getTranslationsByKey("en"));

    expect(processorEN.processString(
      "{{t 'basewords.helloNull'}}"
    )).toBe("");

    expect(processorEN.processString(
      "{{t 'baseNull'}}"
    )).toBe("");

  });

  it("returns empty string if key isn't found in json", function() {
    var tree = path.join(__dirname, 'fixtures/templates/!*.hbs'),
      processorEN = new Processor(tree,translator.getTranslationsByKey("en"));

    expect(processorEN.processString(
      "{{t 'basewords.helloNull'}}"
    )).toBe("");

    expect(processorEN.processString(
      "{{t 'baseNull'}}"
    )).toBe("");

  });

  it("throws error for corner cases", function() {
    var tree = path.join(__dirname, 'fixtures/templates/!*.hbs'),
      processorEN = new Processor(tree,translator.getTranslationsByKey("en"));

    var testFuncEmptyString = function () {
      return processorEN.processString(
        "{{t ''}}"
      );
    };
    expect(testFuncEmptyString).toThrowError(TypeError);
  });

  it('converts named parameters with by indexes', function() {
    expect(this.processorEN.processString(
      "{{t 'basewords.helloName' name surname }}"
    )).toBe(
      "Hello {{name}} {{surname}}"
    );
    expect(this.processorEN.processString(
      "{{t 'destinations.label.customizableTripIdeas' path.to.variable }}"
    )).toBe(
      '<span class=\"count\">{{path.to.variable}}</span> Customizable Trip Ideas'
    );
  });

  it('skips parameters without defined variable', function() {
    expect(this.processorEN.processString(
      "{{t 'basewords.helloName'}}"
    )).toBe(
      "Hello  "
    );
    expect(this.processorEN.processString(
      "{{t 'destinations.label.customizableTripIdeas'}}"
    )).toBe(
      '<span class=\"count\"></span> Customizable Trip Ideas'
    );
  });

  it('can be used as part of expression', function() {
    expect(this.processorEN.processString(
      "{{concat (t 'basewords.hello') 'again' (concat 'hello' (t 'basewords.hello'))}}"
    )).toBe(
      "{{concat 'Hello' 'again' (concat 'hello' 'Hello')}}"
    );
  });

  it('can be used as part of expression with variable', function() {
    expect(this.processorEN.processString(
      "{{concat (t 'basewords.hello') 'again'}}"
    )).toBe(
      "{{concat 'Hello' 'again'}}"
    );

    expect(this.processorEN.processString(
      "{{concat (t 'basewords.hello') 'again' (t 'basewords.helloName' name.in.path)}}"
    )).toBe(
      "{{concat 'Hello' 'again' 'Hello' name.in.path }}"
    );
  });

  it('returns correct html', function() {
    expect(this.processorEN.processString(
      "<h4>{{t 'basewords.hello'}}</h4>{{myvar}}"
    )).toBe(
      "<h4>Hello</h4>{{myvar}}"
    );
  });

  it('drops error for incorrect html', function() {
    var testFuncEmptyString = function () {
      return this.processorEN.processString(
        '<li><a href="/preview" onClick="window.location = \'/preview?ref=\' + window.location ; return false ;" title="{{t "preview.label.switchOn"}}" class="preview-link">{{t "preview.label.switchOn"}}</a></li>'
      );
    };
    expect(testFuncEmptyString).toThrowError(TypeError);
  });

});

describe("errors", function() {
  var translator = require('../..');
  var Processor = require('../../lib/main');
  var fs = require('fs');
  var path = require('path');

  beforeEach(function() {
    translator.config({
      localesDir: "spec/fixtures/locales"
    });
    var tree = path.join(__dirname, 'fixtures/templates/!*.hbs');

    this.processorEN = new Processor(tree,translator.getTranslationsByKey("en2"));

  });

  it("should work in big tempates also", function() {
    var testFuncEmptyString = `<div class="nz-card bg-indigo" data-episode-title="{{model.module.module.title}}">
  <div class="row">
    <div class="col-xs-9">
      <h3 class="h3">
        <span class="episode-index hidden-print" title="{{t "basewords.helloName"}}">{{char-by-index index}}</span>
        <span class="module-label">
          {{model.exchangeableModuleDesc}} - {{t 'basewords.helloName'}}
        </span>
      </h3>
    </div>
    <div class="col-xs-3">
      <a href="#right-menu" class="pull-right btn btn-neutral hidden-print animateScroll" {{action 'focusBaseInfo'}}>
        <span class="glyphicon glyphicon-chevron-up"></span>
        {{t 'exploredetail.action.backToOverview'}}
      </a>
    </div>
  </div>

  {{#common/nz-modal modalID=modalId title=model.module.title buttonClose='yes' onStateUpdate=(action (mut modalState))}}
    {{#if modalShown}}
      {{#common/nz-modal/body class='nz-description'}}
        {{common/nz-description/module/content module=activeModule}}
      {{/common/nz-modal/body}}
    {{/if}}
  {{/common/nz-modal}}

  <div class="carousel carousel-module-group slide" id="carousel-{{uniqid}}" data-ride="carousel" data-interval="false">
    <!-- Wrapper for slides -->
    <div class="carousel-inner" role="listbox">
      {{#each managedModules as |managedModule index|}}
        {{routes/route-details/stoplist-details/managed/item
        model=managedModule
        selectedModule=model.module
        index=index
        modalId=modalId
        showDetails=(action (mut activeModule))
        active=(if (eq managedModule.id model.module.id) true false)}}
      {{/each}}
    </div>
    <a class="left carousel-control" href="#carousel-{{uniqid}}" role="button" data-slide="prev">
      <span class="sr-only">Previous</span>
    </a>
    <a class="right carousel-control" href="#carousel-{{uniqid}}" role="button" data-slide="next">
      <span class="sr-only">Next</span>
    </a>
  </div>

</div>
    `;
    expect(this.processorEN.processString(testFuncEmptyString)).toContain("Hello");
  });

});