[![Build Status](https://travis-ci.org/nezasa/ember-cli-htmlbars-l10n.png?branch=master)](https://travis-ci.org/nezasa/ember-cli-htmlbars-l10n)
# ember-cli-htmlbars-l10n

This addon introduces localization for [htmlbars templates](https://github.com/tildeio/htmlbars) 
It is used as a step during the Ember-CLI build process

# Requirements
First you need [to have ember-cli installed](https://emberjs.com/)

# Installation
Install the plugin by command `ember install ember-cli-htmlbars-l10n`

# Configuration
Describe build in your `ember-cli-build.js`

E.g.:
~~~
// default broccoli app builder
let EmberApp = require('ember-cli/lib/broccoli/ember-app');

// builder for localization
let l10n = require('ember-cli-htmlbars-l10n');

module.exports = function( defaults ) {

  let app = new EmberApp( defaults, {
  
    // here are the settings for localization build 
    l10n : {
    
      // list of required locales 
      locales   : ["en", "de"],
      
      // folder with your json files as sources for translations
      localesDir: "examples/locales"
      
    }
  });

  // build localized apps
  l10n.build(app);


  return app.toTree();
};
~~~

# Features
With this build you may use htmlbars-like helpers expressions to make translations


Simple translation
------------------
~~~
<h4>{{t 'basewords.hello'}}</h4> 

will be converted to:

app_en.js: <h4>Hello</h4>
app_de.js: <h4>Hallo</h4>
~~~

Translation inside of htmlbar-like expression
---------------------------------------------
~~~
<h2>{{concat (t 'basewords.hello') 'John'}}</h2>

will be converted to:

app_en.js: <h2>{{concat 'Hello' 'John'}}</h2>
app_de.js: <h2>{{concat 'Hallo' 'John'}}</h2>
~~~

Translation with parameters
---------------------------
Sometimes you may need to pass some dynamic value to expression
Suppose we have translation like: 

`"helloName": "Hello {0} {1}"`

the `{index}` expression reflects index of passed parameter to use the translation as template 

~~~
<h2>{{concat (t 'basewords.helloName' model.user.name model.user.surname) '!'}}</h2>

will be converted to:

app_en.js: <h2>{{concat 'Hello' model.user.name model.user.surname '!'}}</h2>
app_de.js: <h2>{{concat 'Hallo' model.user.name model.user.surname '!'}}</h2>
~~~

~~~
<h2>{{t 'basewords.helloName' model.user.name model.user.surname}}</h2>

will be converted to:

app_en.js: <h2>Hello {{model.user.name}} {{model.user.surname}}</h2>
app_de.js: <h2>Hallo {{model.user.name}} {{model.user.surname}}</h2>
~~~



