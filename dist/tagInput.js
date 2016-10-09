angular.module('lh.commons.util', [])

(function() {
    'use strict';

    /**
     * Utility to create delegate-handle
     * Used to provide a handle for the controller to access or modify data in a directive
     *
     * In html:
     * <custom-directive delegate-handle="handle_name"></custom-directive>
     *
     * In controller:
     * CustomDirectiveDataService.getByHandle('handle_name').doSomething();
     *
     * In directive:
     * CustomDirectiveDataService.initHandle('handle_name');
     * CustomDirectiveDataService.getByHandle('handle_name').doSomething();
     *
     * In service:
     * service('CustomDirectiveDataService', CustomDirectiveDataService)
     * function CustomDirectiveDataService(DelegateHandle) {
     *
     *    //prefix is used in a directives that did have `delegate-handle` attr, it generate a id with that prefix
     *    return DelegateHandle(CustomDirectiveData, 'prefix');
     * }
     * CustomDirectiveData.$inject = [...]
     * function CustomDirectiveData(...){ ... };
     *
     */

    angular
        .module('lh.commons.util')
        .factory('DelegateHandle', DelegateHandle);

    DelegateHandle.$inject = ['$injector'];

    function DelegateHandle($injector) {
        return {
            create: create
        };
        function create(clz, prefix) {
            return new DelegateHandleMap(clz, prefix);
        }
        function DelegateHandleMap(clz, prefix){
            /*jshint validthis:true */
            this._prefix = prefix;
            this._clz = clz;
            this.data = {};
            this._index = 0;

            this.initHandle = initHandle;
            this.getByHandle = getByHandle;
            this.generateHandle = generateHandle;
            this.removeHandle = removeHandle;

            //////////////////////

            function initHandle(handle) {
                if (!angular.isString(handle) || handle === '') {
                    throw new Error('handle is not a sring');
                }
                this.data[handle] = $injector.instantiate(this._clz);
                return this.data[handle];
            }

            function getByHandle(handle) {
                if (!angular.isString(handle) || handle === '') {
                    throw new Error('handle is not a sring');
                }
                if(angular.isUndefined(this.data[handle])){
                    return this.initHandle.call(this, handle);
                }
                return this.data[handle];
            }

            function generateHandle(){
                return this._prefix + (this._index ++ % 1000000);
            }

            function removeHandle(handle) {
                if (!angular.isString(handle) || handle === '') {
                    throw new Error('handle is not a sring');
                }
                delete this.data[handle];
            }
        }
    }

})();

(function() {
    'use strict';

    /**
     *
     * Observer Pattern
     *
     * Listener.create -> return a new listener object
     *
     * listener object
     * listener.on -> register callback, return deregister callback function
     * listener.off -> deregister callback
     * listener.notify -> fire events, call all callbacks registered
     *
     */

    angular
        .module('lh.commons.util')
        .factory('Listener', ListenerService);

    ListenerService.$inject = ['$timeout'];

    function ListenerService($timeout) {
        return {
            create: create
        };
        function create() {
            return new Listener();
        }
        function Listener(){
            var listener = this;
            listener.cb = [];

            listener.on = on;
            listener.off = off;
            listener.notify = notify;

            //////////////////////
            function on(cb){
                if (!angular.isFunction(cb)) {
                    return angular.noop;
                }
                if(listener.cb.indexOf(cb) === -1){
                    listener.cb.push(cb);
                }
                return listener.off.bind(listener, cb);
            }

            function off(cb){
                var index = listener.cb.indexOf(cb);
                if(index > -1){
                    listener.cb.splice(index, 1);
                }
            }

            function notify(){
                var args = arguments;

                listener.cb.forEach(function(cb){
                    $timeout(function(){
                        cb.apply(null, args);
                    });
                });
            }

        }

    }

})();

(function(){
    'use strict';

    angular.module('ui.taginput', [
        'lh.commons.util',
    ]);

})();

(function(){
    'use strict';

    angular.module('ui.taginput')
        .factory('TagInputConfig', TagInputConfig);

    TagInputConfig.$inject = ['DelegateHandle'];
    function TagInputConfig(DelegateHandle){
         return DelegateHandle.create(TagInput, 'tag-input');
    }

    TagInput.$inject = ['Listener'];
    function TagInput(Listener){
        var defaultConfig = {
            displayProperty: 'value',
            keyProperty: 'value',
            type: 'text',
            minLength: 0,
            maxLength: Number.MAX_SAFE_INTEGER,
            minTags: 0,
            maxTags: Number.MAX_SAFE_INTEGER,
            allowMoreThanMaxTags: true,
            placeholder: '',
            icon: '',
            addOnEnter: true,
            addOnSpace: false,
            addOnComma: true,
            addOnBlur: true,
            allowedTagsPattern: '.+',
            allowedTagsPatternRegex: new RegExp('.+'),
            enableEditingLastTag: false,
        };

        /*
            TagInput Class
        */
        var TagInput = {};
        TagInput._config = defaultConfig;
        TagInput._tags = [];
        TagInput._text = '';
        TagInput._onTagAddedListener = Listener.create();
        TagInput._onTagRemovedListener = Listener.create();
        TagInput.pushTag = _pushTag;
        TagInput.popTag = _popTag;
        TagInput.config = config;
        TagInput.text = text;
        TagInput.getTags = getTags;
        TagInput.getTagByKey = getTagByKey;
        TagInput.displayTag = displayTag;
        TagInput.onTagAdded = TagInput._onTagAddedListener.on;
        TagInput.onTagRemoved = TagInput._onTagRemovedListener.on;
        return TagInput;

        function _pushTag(tag){
            if (!angular.isDefined(tag)){
                if(TagInput.text() !== ''){
                    var success = pushTagFromText(TagInput.text());
                    if(success) {
                        TagInput.text('');
                    }
                    return success;
                }
            } else if (angular.isString(tag)){
                if(tag !== '' &&
                    TagInput._config.allowedTagsPatternRegex.test(tag) &&
                    tag.length >= TagInput._config.minLength &&
                    tag.length <= TagInput._config.maxLength){
                    return pushTagFromText(tag);
                }
            } else if (angular.isArray(tag)) {
                var success = true;
                for(var i=0; i<tag.length; i++){
                    if(!_pushTag(tag[i])){
                        success = false;
                    }
                }
                return success;
            } else if(angular.isObject(tag)){
                return pushTag(tag);
            }
            return false;
        }
        function pushTagFromText(text){
            var newTag = {};
            newTag[TagInput._config.displayProperty] = text;
            newTag[TagInput._config.keyProperty] = text;
            return pushTag(newTag);
        }
        function pushTag(tag){
            // check if allow more tags
            if(!TagInput._config.allowMoreThanMaxTags && TagInput._tags.length >= TagInput._config.maxTags){
                return false;
            }
            // check if tags duplicate
            if(TagInput.getTagByKey(tag[TagInput._config.keyProperty]) !== null){
                return false;
            }
            // push tag
            TagInput._tags.push(tag);
            // trigger event
            TagInput._onTagAddedListener.notify(tag);
            // return true
            return true;
        }

        function _popTag(tag){
            if(!angular.isDefined(tag)){
                return popTagFromIndex(TagInput._tags.length - 1);
            }else if(angular.isNumber(tag)){
                return popTagFromIndex(tag);
            }else if(angular.isObject(tag)){
                return popTag(tag);
            }else{
                return null;
            }
        }
        function popTagFromIndex(idx){
            if(idx >= 0){
                var tagRemoved = TagInput._tags.splice(idx, 1);
                if(tagRemoved.length === 1){
                    TagInput._onTagRemovedListener.notify(tagRemoved[0]);
                    return tagRemoved[0];
                }
            }
            return null;
        }
        function popTag(tag){
            return popTagFromIndex(TagInput._tags.indexOf(tag));
        }
        function config(name, value){
            if (angular.isDefined(value)) {
                var c = {};
                c[name] = value;
                extendConfig(c);
            }else if(angular.isString(name)){
                return TagInput._config[name]
            }else if(angular.isObject(name)){
                extendConfig(name);
            }else{
                throw new Exception("Unsupported Operation");
            }
        }
        function text(value){
            if(angular.isDefined(value)){
                TagInput._text = value;
            }else{
                return TagInput._text;
            }
        }
        function getTags() {
            return TagInput._tags;
        }
        function getTagByKey(key){
            var keyProperty = TagInput._config.keyProperty;
            for(var i=0; i<TagInput._tags.length; i++){
                if(TagInput._tags[i][keyProperty] === key){
                    return TagInput._tags[i];
                }
            }
            return null;
        }
        function displayTag(tag){
            return tag[TagInput._config.displayProperty];
        }

        function extendConfig(config) {
            if(angular.isDefined(config.displayProperty)){
                TagInput._config.displayProperty = makeString(config.displayProperty);
            }
            if(angular.isDefined(config.keyProperty)){
                TagInput._config.keyProperty = makeString(config.keyProperty);
            }
            if(angular.isDefined(config.type)){
                TagInput._config.type = makeString(config.type);
            }
            if(angular.isDefined(config.minLength) && isNumber(config.minLength)){
                TagInput._config.minLength = makeNumber(config.minLength);
            }
            if(angular.isDefined(config.maxLength) && isNumber(config.maxLength)){
                TagInput._config.maxLength = makeNumber(config.maxLength);
            }
            if(angular.isDefined(config.minTags) && isNumber(config.minTags)){
                TagInput._config.minTags = makeNumber(config.minTags);
            }
            if(angular.isDefined(config.maxTags) && isNumber(config.maxTags)){
                TagInput._config.maxTags = makeNumber(config.maxTags);
            }
            if(angular.isDefined(config.allowMoreThanMaxTags) && isBoolean(config.allowMoreThanMaxTags)){
                TagInput._config.allowMoreThanMaxTags = makeBoolean(config.allowMoreThanMaxTags);
            }
            if(angular.isDefined(config.placeholder)){
                TagInput._config.placeholder = makeString(config.placeholder);
            }
            if(angular.isDefined(config.icon)){
                TagInput._config.icon = makeString(config.icon);
            }
            if(angular.isDefined(config.addOnEnter) && isBoolean(config.addOnEnter)){
                TagInput._config.addOnEnter = makeBoolean(config.addOnEnter);
            }
            if(angular.isDefined(config.addOnSpace) && isBoolean(config.addOnSpace)){
                TagInput._config.addOnSpace = makeBoolean(config.addOnSpace);
            }
            if(angular.isDefined(config.addOnComma) && isBoolean(config.addOnComma)){
                TagInput._config.addOnComma = makeBoolean(config.addOnComma);
            }
            if(angular.isDefined(config.addOnBlur) && isBoolean(config.addOnBlur)){
                TagInput._config.addOnBlur = makeBoolean(config.addOnBlur);
            }
            if(angular.isDefined(config.allowedTagsPattern)){
                TagInput._config.allowedTagsPattern = config.allowedTagsPattern;
                TagInput._config.allowedTagsPatternRegex = new RegExp(config.allowedTagsPattern);
            }
            if(angular.isDefined(config.enableEditingLastTag) && isBoolean(config.enableEditingLastTag)){
                TagInput._config.enableEditingLastTag = makeBoolean(config.enableEditingLastTag);
            }
        }
        function isNumber(str){
            return /^\d+$/.test(str);
        }
        function isBoolean(str){
            return /^(false|true)$/.test(str);
        }
        function makeBoolean(str){
            return String(str) === 'true';
        }
        function makeString(str){
            return String(str);
        }
        function makeNumber(str){
            return parseInt(str);
        }
    }

})();

(function(){
    'use strict';

    angular.module('ui.taginput')
        .directive('tagList', uiTagList);

    uiTagList.$inject = ['TagInputConfig'];
    function uiTagList(TagInputConfig) {
        return {
            restrict: 'E',
            template: '<div class="tag-container">' +
                        '<pill class="ui-tag-input-pill" ng-click="tagInput.popTag(tag)" ng-repeat="tag in tagInput.getTags()">{{tagInput.displayTag(tag)}} <i class="ion-close-round"></i></pill>' +
                      '</div>',
            scope: {
                uiTagInputId: '@',
            },
            link: link,
        };

        /////////////////////////

        function link($scope){
            $scope.tagInput = TagInputConfig.getByHandle($scope.uiTagInputId);
        }
    }
})();

(function(){
    'use strict';

    angular.module('ui.taginput')
        .directive('tagInput', TagInput);

    TagInput.$inject = ['$timeout', '$interpolate', 'TagInputConfig'];
    function TagInput($timeout, $interpolate, TagInputConfig){
        return {
            restrict: 'E',
            replace: true,
            require: 'ngModel',
            scope: {
                uiTagInputId: '@',
                tags: '=ngModel',
            },
            template: '<div class="item ui-tag-input">' +
                '<tag-list ui-tag-input-id="{{::uiTagInputId}}"></tag-list>' +
                '<growing-input ui-tag-input-id="{{::uiTagInputId}}"></growing-input>' +
            '</div>',
            compile: function(element, attrs){
                TagInputConfig.getByHandle(attrs.uiTagInputId).config(attrs);
                return linkFn;
            },
        };
        function linkFn($scope, $element, attrs, ngModelCtrl){
            var tagInput = TagInputConfig.getByHandle($scope.uiTagInputId);
            var inputElement = $element.find("input")[0];

            //add icon if needed
            if(tagInput.config('icon') !== ''){
                var interpolatedIcon = $interpolate('<span class="icon ion {{icon}} "></span>')({ icon: tagInput.config('icon') });
                $element.prepend(angular.element(interpolatedIcon));
                $element.addClass('withIcon');
            }

            $element.bind("click", function(event){
                if(event.target == $element[0]){
                    $timeout(function(){
                        inputElement.focus();
                    });
                }
            });

            ngModelCtrl.$isEmpty = function(value) {
                return !value || !value.length;
            };

            function onTagChanged(){
                //update ng-model
                $scope.tags = tagInput.getTags();
                //update scroll
                updateScroll();
                //set validity
                ngModelCtrl.$setDirty();
                setElementValidity();
                //disable or enable input text depends on config
                if(!tagInput.config('allowMoreThanMaxTags')){
                    disallowMoreTag();
                }
            }
            function setElementValidity(){
                ngModelCtrl.$setValidity('maxTags', tagInput.getTags().length <= tagInput.config('maxTags'));
                ngModelCtrl.$setValidity('minTags', tagInput.getTags().length >= tagInput.config('minTags'));
                ngModelCtrl.$validate();
            }

            function updateScroll(){
                $timeout(function(){
                    $element[0].scrollLeft = $element[0].scrollWidth;
                });
            }

            tagInput.onTagAdded(onTagChanged);
            tagInput.onTagRemoved(onTagChanged);

            if($scope.tags && $scope.tags.length > 0){
                ngModelCtrl.$setDirty();
                $scope.tags.forEach(function(tag){
                    tagInput.pushTag(tag);
                });
            }
            //add .ui-tag-full class if do not allow more than max tag
            function disallowMoreTag(){
                if(tagInput.getTags().length == tagInput.config("maxTags")){
                    $element.addClass('ui-tag-full');
                }else{
                    $element.removeClass('ui-tag-full');
                }
            }
            setElementValidity();
        }
    }

})();

(function(){
    'use strict';

    angular.module('ui.taginput')
        .directive('growingInput', uiGrowingInput);

    uiGrowingInput.$inject = ['TagInputConfig', '$timeout'];
    function uiGrowingInput(TagInputConfig, $timeout) {
        // key constant
        var KEY_BACKSPACE = 8,
            KEY_DELETE = 46,
            KEY_ENTER = 13,
            KEY_SPACE = 32,
            KEY_COMMA = 188;

        return {
            restrict: 'E',
            template:
                '<div class="growingInput">' +
                    '<input ' +
                        'type="text" ' +
                        'placeholder="{{::placeholder}}" ' +
                        'type="{{::inputType}}" ' +
                        'ng-keydown="onKeyDown($event)" ' +
                        'ng-change="onInputChanged()" ' +
                        'ng-blur="onInputBlur()" ' +
                        'ng-model="tagInput._text">' +
                    '<span class="hiddenText">{{tagInput._text || placeholder}}</span>' +
                '</div>',
            link: link,
        };

        function link(scope, elem, attr){
            var tagInputId = attr.uiTagInputId;
            var inputElement = elem.find("input");
            var spanElement = elem.find("span");

            ////////////////////
            var tagInput = TagInputConfig.getByHandle(tagInputId);
            scope.tagInput = tagInput;
            scope.placeholder = tagInput.config("placeholder");
            scope.inputType = tagInput.config("type");
            scope.onInputBlur = onInputBlur;
            scope.onInputChanged = onInputChanged;
            scope.onKeyDown = onKeyDown;

            //disable or enable input text depends on config
            if(!tagInput.config('allowMoreThanMaxTags')){
                var offTagAdded = tagInput.onTagAdded(disallowMoreTag);
                var offTagRemoved = tagInput.onTagRemoved(disallowMoreTag);
                scope.$on('$destroy', function(){
                    offTagAdded();
                    offTagRemoved();
                });
            }

            function onInputChanged(){
                //update width accordingly
                var width = spanElement.width() + 20;
                inputElement.css('width', width + 'px');
                //remove error
                inputElement.removeClass('error');
            }

            function onInputBlur(){
                //TODO blur will trigger event when click to delete tag
                tagInput.pushTag();
            }

            function onKeyDown(event) {
                var key = event.which;
                if(key === KEY_BACKSPACE || key === KEY_DELETE){
                    if(getCaret(inputElement[0]) === 0){
                        var tagRemoved = tagInput.popTag();
                        //If enable edit last tag
                        if(tagRemoved !== null && tagInput.config('enableEditingLastTag')){
                            var tagText = tagRemoved[tagInput.config('displayProperty')];
                            tagInput.text( tagText + tagInput.text());
                            // $timeout(function() {
                                setCaret(inputElement[0], tagText.length);
                            // });
                        }
                        event.preventDefault();
                    }
                } else if((key === KEY_ENTER && tagInput.config('addOnEnter')) ||
                        (key === KEY_SPACE && tagInput.config('addOnSpace')) ||
                        (key === KEY_COMMA && tagInput.config('addOnComma'))) {
                    pushTagAtCaret();
                    event.preventDefault();
                }
            }
            //create a tag for text infront of the caret
            function pushTagAtCaret(){
                var caret = getCaret(inputElement[0]);
                var text = tagInput.text();
                var subtext = text.substring(0, caret);
                $timeout(function(){
                    if(tagInput.pushTag(subtext)){
                        tagInput.text(text.substring(caret));
                        $timeout(function(){
                            setCaret(inputElement[0], 0);
                        });
                    }else{
                        //failed to create tag
                        inputElement.addClass('error');
                    }
                });
            }
            function getCaret(e){
                return (e.selectionStart === e.selectionEnd) ? e.selectionStart : -1;
            }
            function setCaret(e, pos){
                e.setSelectionRange(pos, pos);
            }

            function disallowMoreTag(){
                if(tagInput.getTags().length == tagInput.config("maxTags")){
                    inputElement.blur();
                    inputElement.attr('disabled', 'disabled');
                    inputElement.addClass('ui-tag-hide');
                }else{
                    inputElement.removeAttr('disabled');
                    inputElement.removeClass('ui-tag-hide');
                }
            }
        }
    }
})();
