var Filter = require('broccoli-filter'),
  pathExpr = /\{\{t\s(?:'|")(\S*)(?:'|")\s?(.*)}}/g;

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
    res;

  if (that.localeData) {
    res = str.replace(pathExpr, function() {
      if (!arguments[1].length) {
        throw new TypeError("path for translation is empty");
      }
      var params = arguments[2] ? arguments[2].split(" ") : [];
      return (new Function("" +
        "var data = arguments;" +
        "try{var result = this." + arguments[1] + " || null} catch (e) {};" +
        "if (!result) {return '';}" +
        "result = result.replace(/\{(\.)\}+/g, function() {" +
        "var index = parseInt(arguments[1], 10);" +
        "return (data[index] ? '{{' + data[index] + '}}' : '');" +
        "});" +
        "return result;" +
        "")).bind(that.localeData).apply(this, params);
    });
  } else {
    res = str;
  }
  //console.log(res);
  return res;
};

module.exports = Main;