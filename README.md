# tag-input for Ionic [![Build Status](https://travis-ci.org/ionic-widget/ui-tag-input.svg?branch=master)](https://travis-ci.org/ionic-widget/ui-tag-input)

## Installation

1. Install via bower

    `bower install --save ui-tag-input`

## Screenshot

![screenshot](https://github.com/ionic-widget/tag-input/blob/development/screenshot/screenshot.gif?raw=true "Screenshot")

## Usage

1. Add `jQuery.js` and `tagInput.js` into `index.html`

    ```javascript
    <script src="lib/jquery/dist/jquery.min.js"></script>
    <script src="lib/ionic/js/ionic.bundle.js"></script>
    ...
    <script src="lib/ui-tag-input/tagInput.min.js"></script>
    ```
2. Import tagInput.sccs into `scss/ionic.app.scss`

    ```sass
    @import "www/lib/ionic/scss/ionic";
    @import "www/lib/ui-tag-input/tagInput";
    ```

    and run `grunt` to compile `sass`

3. Add into your controllers module
    `angular.module('app.controllers', ['ui.taginput'])`

## Wiki

See [wiki](https://github.com/ionic-widget/ui-tag-input/wiki) for configuration options
