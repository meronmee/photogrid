# grunt-temp

> Description here

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-temp --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-temp');
```

## The "temp" task

### Overview
In your project's Gruntfile, add a section named `temp` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  temp: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.type
Type: `(Necessary) String`
Default value: `null`


A string value that defines what type of reference should the task/target update in the src html file. It must be `'js'` or `'css'`, and you need to 
specify it youself.

#### options.from
Type: `(Necessary) String|Array of string`
Default value: `null`


It defines which reference will be updated/removed. If it is a string, it will be replaced by `options.to`, and if it is an array of string, only the first one  will be replaced by `options.to`, and the others will be removed. It's default value is null, so you need to specify it youself.

#### options.to
Type: `(Necessary) String`
Default value: `''`


It defines what `options.from` will be replaced with. If `options.prefix` is defiend, it will be merged with `options.prefix`. You need to specify it youself.

#### options.prefix
Type: `(Optional) String|Array`
Default value: `''`

If it is a string, the final `options.to` will be `options.to = options.prefix + options.to`; If it is an array of string, it should contain two elements, and the final `options.to` will be `options.to = options.to.replace(options.prefix[0], options.prefix[1])`.

### Usage Examples

#### Update reference to external `css` file
In this example, references contain strings in `options.form` in the src file `'test/src/formated.html'` will be replaced by `options.to: 'libs/libs.css(merged with options.prefix)'`, and the result will be saved to `dest:'test/dist/formated.html'`.

```js
grunt.initConfig({
  temp: {
    css: {
        options: {           
            type: 'css',
            prefix: ['dist/', ''],
            from: [
                'bootstrap.css', 
                'messenger.css'
            ],
            to: 'dist/libs/libs.css'
        },
        src: 'test/src/formated.html',
        dest: 'test/dist/formated.html'
      }//eof:temp:css target
  }//eof:temp task
});
```
The src file `test/src/formated.html` maybe like:
```html
 ...
<meta charset="utf-8">
<link href="libs/bootstrap/css/bootstrap.css" rel="stylesheet">
<link href="libs/font-awesome/css/font-awesome.css" rel="stylesheet">
<link href="libs/messenger/css/messenger.css" rel="stylesheet">
...
```
and the dest file `'test/dist/formated.html'` will like:
```html
...
<meta charset="utf-8">
<link href="libs/libs.css" rel="stylesheet">
<link href="libs/font-awesome/css/font-awesome.css" rel="stylesheet">
...
```
#### Update reference to external `js` file
In this example, references contain strings in `options.form` in the src file `'test/src/formated.html'` will be replaced by `options.to: 'libs/libs.js(merged with options.prefix)'`, and the result will be saved to `dest:'test/dist/formated.html'`.

```js
grunt.initConfig({
  temp: {
    js: {
        options: {
            type: 'js',
            prefix: ['dist/', ''],
            from: [
                'jquery.js', 
                'bootstrap.js',
                'underscore.js'
            ],
            to: 'dist/libs/libs.js'
        },
        src: 'test/src/formated.html',
        dest: 'test/dist/formated.html'
    }//eof:temp:js target
  }//eof:temp task
});
```
The src file `test/src/formated.html` maybe like:
```html
 ...
<script src='libs/jquery.js' type='text/javascript'></script>
<script src='libs/bootstrap/js/bootstrap.js' type='text/javascript'></script>
<script src='libs/underscore/underscore.js' type='text/javascript'></script>
<script src='js/utils.js' type='text/javascript'></script> 
...
```
and the dest file `'test/dist/formated.html'` will like:
```html
...
<script src='libs/libs.js' type='text/javascript'></script> 
<script src='js/utils.js' type='text/javascript'></script> 
...
```

## Release History
* 2013-12-26    v0.1.0
