# tag-input for Ionic

[![Build Status](https://travis-ci.org/ionic-widget/ui-tag-input.svg?branch=master)](https://travis-ci.org/ionic-widget/ui-tag-input)
[![npm version](https://img.shields.io/npm/v/ui-tag-input.svg)](https://www.npmjs.com/package/ui-tag-input)
[![npm license](https://img.shields.io/npm/l/ui-tag-input.svg)](https://www.npmjs.com/package/ui-tag-input)
[![bower version](https://img.shields.io/bower/v/ui-tag-input.svg)](https://github.com/ionic-widget/ui-tag-input)
[![codecov](https://codecov.io/gh/ionic-widget/ui-tag-input/branch/master/graph/badge.svg)](https://codecov.io/gh/ionic-widget/ui-tag-input)

## Installation

1. Install via bower

    `bower install --save ui-tag-input`

## Screenshot

![screenshot](https://github.com/ionic-widget/tag-input/blob/development/screenshot/screenshot.gif?raw=true "Screenshot")

## Usage

1. Add `jQuery.js` and `tagInput.min.js` into `index.html`

    ```javascript
    <script src="lib/jquery/dist/jquery.min.js"></script>
    <script src="lib/ionic/js/ionic.bundle.js"></script>
    ...
    <script src="lib/ui-tag-input/dist/tagInput.min.js"></script>
    ```
2. Import tagInput.sccs into `scss/ionic.app.scss`

    ```sass
    @import "www/lib/ionic/scss/ionic";
    @import "www/lib/ui-tag-input/dist/tagInput";
    ```

3. Run `gulp` to compile `sass`

    ```sh
    $ gulp sass
    ```

4. Add into your controllers module
    `angular.module('app.controllers', ['ui.taginput'])`

## Wiki

See [wiki](https://github.com/ionic-widget/ui-tag-input/wiki) for configuration options
