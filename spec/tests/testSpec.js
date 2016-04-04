describe("ember-cli-htmlbars-l10n", function() {
  var translator = require('../..');
  var Processor = require('../../lib/main');
  var fs = require('fs');
  var path = require('path');

  var fixtures = path.join(__dirname, 'fixtures');

  beforeEach(function() {
    translator.config({
      localesDir: "spec/fixtures/locales"
    });
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
    var tree = path.join(__dirname, 'fixtures/templates/*.hbs'),
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
    var tree = path.join(__dirname, 'fixtures/templates/*.hbs'),
      processorEN = new Processor(tree,translator.getTranslationsByKey("en"));

    expect(processorEN.processString(
      "{{t 'basewords.helloNull'}}"
    )).toBe("");

    expect(processorEN.processString(
      "{{t 'baseNull'}}"
    )).toBe("");

  });

  it("returns empty string if key isn't found in json", function() {
    var tree = path.join(__dirname, 'fixtures/templates/*.hbs'),
      processorEN = new Processor(tree,translator.getTranslationsByKey("en"));

    expect(processorEN.processString(
      "{{t 'basewords.helloNull'}}"
    )).toBe("");

    expect(processorEN.processString(
      "{{t 'baseNull'}}"
    )).toBe("");

  });

  it("throws error for corner cases", function() {
    var tree = path.join(__dirname, 'fixtures/templates/*.hbs'),
      processorEN = new Processor(tree,translator.getTranslationsByKey("en"));

    var testFuncEmptyString = function () {
      return processorEN.processString(
        "{{t ''}}"
      );
    };
    expect(testFuncEmptyString).toThrowError(TypeError, "path for translation is empty");
  });

  it('converts named parameters with by indexes', function() {
    var tree = path.join(__dirname, 'fixtures/templates/*.hbs'),
        processorEN = new Processor(tree,translator.getTranslationsByKey("en2"));

    expect(processorEN.processString(
      "{{t 'basewords.helloName' name surname }}"
    )).toBe(
      "Hello {{name}} {{surname}}"
    );
    expect(processorEN.processString(
      "{{t 'destinations.label.customizableTripIdeas' path.to.variable }}"
    )).toBe(
      '<span class=\"count\">{{path.to.variable}}</span> Customizable Trip Ideas'
    );
  });

});
