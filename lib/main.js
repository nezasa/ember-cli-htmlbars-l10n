var Filter = require('broccoli-filter'),
  // we should handle strings {{t 'root.path'}} and (t 'root.path')
  pathExpr = /(\{\{|\()t\s(?:'|")([^\'\"]*)(?:'|")\s?([^\}\)]*)(?:\}\}|\))/g;

function Main(inputTree, localeData) {
  if (!(this instanceof Main)) {
    return new Main(inputTree, localeData);
  }

  Filter.call(this, inputTree, localeData);
  if (typeof localeData !== "undefined") {
    this.localeData = localeData;
  }

  this.inputTree = inputTree;
}

Main.prototype = Object.create(Filter.prototype);
Main.prototype.constructor = Main;
Main.prototype.extensions = ['hbs'];
Main.prototype.targetExtension = 'hbs';
Main.prototype.processString = function (str) {
  var that = this,
    res = str;

    // general exception handling
    try {

      // if we have Object with translations (localeData) we can try to translate smth.
      if (that.localeData) {

        // pathExpr defines rules to catch required expressions to replace with translated string
        res = str.replace(pathExpr, function() {

          // emit exception for empty paths like '(t "")'
          if (!arguments[2].length) {
            throw new TypeError("path for translation is empty");
            return;
          }

          /**
           * second argument contain path and optional variable
           * e.g. for {{t 'root.path' my.super.variable}}
           * will be
           * params[0] -> {string} 'root.path'
           * params[1] -> {string} 'my.super.variable'
           */
          var params = arguments[3] ? arguments[3].split(" ") : [];
          var expressionMode = arguments[1].startsWith("(");
          var result = (new Function(`
            var data = arguments;
            var expressionMode = ${expressionMode};
            try {
              // fetch value by binded context value

              var result = this.${arguments[2]} || null
            } catch (e) {}; // we have empty catch as we decided to render empty string in case of absent field in translation

            // return empty string in case we are not succeed to get translation
            if (!result) {
              return '';
            }

            // if we have translation - process index arguments to pass value by index
            // e.g. "Hello {0} {1}"
            // with data['name', 'surname']
            // will be converted to "Hello {{name}} {{surname}}"

            var indexExpr = /\{(\.)\}+/g;

            // for translations in htmlbar expressions e.g. {{concat "something" (t 'translation.path' my.ember.variable)}}
            // we should quote only translation and keep variable markers
            if (expressionMode && result.match(indexExpr)) {
              result = result.replace(/^([^\s\{]+)([^\{]+)/g, "\x27$1\x27$2");
            }
            var res = result.replace(indexExpr, function() {
              var res = '';
              var index = parseInt(arguments[1], 10);

              if (data[index]) {
                res = expressionMode ? data[index] : '{{' + data[index] + '}}';
              }

             return res;
            });
            if (expressionMode && !result.match(indexExpr)) {
              return "\x27" + res + "\x27";
            }

            return res;
            `)).bind(that.localeData).apply(this, params);

          return result;

        });


      }
    } catch (e) {
      throw new TypeError('Parsing failed on: ' + str + ', ' + e.stack);
    }
  return res;
};

module.exports = Main;