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
                return pushTagFromText(tag);
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
            if(text !== '' &&
                TagInput._config.allowedTagsPatternRegex.test(text) &&
                text.length >= TagInput._config.minLength &&
                text.length <= TagInput._config.maxLength){
                var newTag = {};
                newTag[TagInput._config.displayProperty] = text;
                newTag[TagInput._config.keyProperty] = text;
                return pushTag(newTag);
            }
            return false;
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
            }else if(angular.isObject(name) && !angular.isArray(name)){
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
