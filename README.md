# tag-input for Ionic

## Installation

1. Install via bower

    `bower install --save ui-tag-input`

## Screenshot

![screenshot](https://github.com/ionic-widget/tag-input/blob/master/screenshot/screenshot.png?raw=true "Screenshot")

## Usage

1. Add tagInput.js into `index.html`

    ```javascript
    <script src="lib/tag-input/tagInput.js"></script>
    ```
2. Import tagInput.sccs into `scss/ionic.app.scss`

    ```sass
    @import "www/lib/ionic/scss/ionic";
    @import "www/lib/tag-input/tagManager";
    ```

3. Add into your controller
    `angular.module('app.controllers', ['ui.taginput'])`

4. Add into your view

    `<tag-input tags="tags" icon="ion-pricetag" placeholder="Placeholder" input-model="text"></tag-input>`

    * `tags` - array of objects, eg: `[{key: '1', value: 'Hello'}, {key: '2', value: 'World'}]`
    * `icon` - ionicon class
    * `placeholder` - placeholder for the input
    * `input-model` - eg. `{value: 'text'}`
