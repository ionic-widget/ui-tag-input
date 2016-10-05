(function(){
    'use strict';

    angular.module('ui.taginput')
        .factory('TagInputConfig', TagInputConfig);

    TagInputConfig.$inject = [];
    function TagInputConfig(){
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
            enableEditingLastTag: false,
        };

        var config = {};
        config.create = create;

        function createConfig(configs){
            configs = configs || {};
            configs.displayProperty = angular.isDefined(configs.displayProperty) ? configs.displayProperty : 'value';
            configs.keyProperty = angular.isDefined(configs.keyProperty) ? configs.keyProperty : 'value';
            configs.type = angular.isDefined(configs.type) ? configs.type : 'text';
            configs.minLength = angular.isDefined(configs.minLength) ? configs.minLength : 0;
            configs.maxLength = angular.isDefined(configs.maxLength) ? configs.maxLength : Number.MAX_SAFE_INTEGER;
            configs.minTags = angular.isDefined(configs.minTags) ? configs.minTags : 0;
            configs.maxTags = angular.isDefined(configs.maxTags) ? configs.maxTags : Number.MAX_SAFE_INTEGER;
            configs.allowMoreThanMaxTags = angular.isDefined(configs.allowMoreThanMaxTags) ? configs.allowMoreThanMaxTags : true;
            configs.placeholder = angular.isDefined(configs.placeholder) ? configs.placeholder : '';
            configs.icon = angular.isDefined(configs.icon) ? configs.icon : '';
            configs.addOnEnter = angular.isDefined(configs.addOnEnter) ? configs.addOnEnter : true;
            configs.addOnSpace = angular.isDefined(configs.addOnSpace) ? configs.addOnSpace : false;
            configs.addOnComma = angular.isDefined(configs.addOnComma) ? configs.addOnComma : true;
            configs.addOnBlur = angular.isDefined(configs.addOnBlur) ? configs.addOnBlur : true;
            configs.allowedTagsPattern = angular.isDefined(configs.allowedTagsPattern) ? configs.allowedTagsPattern : '.+';
            configs.allowedTagsPatternRegex = new RegExp(configs.allowedTagsPattern);
            configs.enableEditingLastTag = angular.isDefined(configs.enableEditingLastTag) ? configs.enableEditingLastTag : false;
            return configs;
        }
        var tagInput = {};



        var Type = function Type(){};
        var defaultConfig = {
            'displayProperty': {type: String, default: 'value'},
            'keyProperty': {type: String, default: 'value'},
            'type': {type: Type, default: 'text'},
            'minLength': {type: Number, default: 0},
            'maxLength': {type: Number, default: Number.MAX_SAFE_INTEGER},
            'minTags': {type: Number, default: 0},
            'maxTags': {type: Number, default: Number.MAX_SAFE_INTEGER},
            'allowMoreThanMaxTags': {type: Boolean, default: true },
            'placeholder': {type: String, default: ''},
            'icon': {type: String, default: '' },
            'addOnEnter': {type: Boolean, default: true },
            'addOnSpace': {type: Boolean, default: false },
            'addOnComma': {type: Boolean, default: true },
            'addOnBlur': {type: Boolean, default: true },
            // 'addOnPaste': {type: Boolean, default: false },
            'allowedTagsPattern': {type: String, default: '.+'},
            'enableEditingLastTag': {type: Boolean, default: false},
        };
        var allowedType = ['text', 'email', 'url'];
        /*
            Config Class
        */
        var Config = Model({
            init: function(config){
                for(var c in defaultConfig){
                    this[c] = clean(defaultConfig[c].type, config[c], defaultConfig[c].default);
                }
                this.allowedTagsPatternRegex = new RegExp(this.allowedTagsPattern);
            },
            extend: function(config){
                for(var c in defaultConfig){
                    this[c] = clean(defaultConfig[c].type, config[c], this[c]);
                }
                this.allowedTagsPatternRegex = new RegExp(this.allowedTagsPattern);
            },
            set: function(name, value){
                if(name in this){
                    this[name] = clean(defaultConfig[name].type, value, this[name]);
                    //for special needs
                    if(name === 'allowedTagsPattern'){
                        this.allowedTagsPatternRegex = new RegExp(this.allowedTagsPattern);
                    }
                }
            }
        });
        /*
            private Config methods
        */
        var cleanFn = {};
        cleanFn[String] = function(value){ return angular.isString(value) ? value : undefined; };
        cleanFn[Number] = function(value){ return (/^\d+$/.test(value)) ? parseInt(value) : undefined; };
        cleanFn[Array] = function(value){ return (angular.isArray(value)) ? value : undefined; };
        cleanFn[Boolean] = function(value){ if(value === true || value === false){ return value; } else if (angular.isString(value)){ if(value === 'true') return true; if(value === 'false') return false; } return undefined;};
        cleanFn[Type] = function(value){ for(var i=0; i<allowedType.length; i++){ if(allowedType[i] === value ) return allowedType[i]; } return undefined; };

        function clean(type, value, def){
            if(cleanFn[type]){
                var cleaned = cleanFn[type](value);
                return (cleaned == undefined) ? def : cleaned;
            }else{
                return null;
            }
        }

        /*
            TagInput Class
        */
        var TagInput = {};
        TagInput._config = {};
        TagInput._tags = [];
        TagInput._text = '';
        TagInput.init = init;
        TagInput.pushTag = _pushTag;
        TagInput.popTag = _popTag;
        TagInput.config = config;
        TagInput.text = text;
        TagInput.getTags = getTags;
        TagInput.getTagByKey = getTagByKey;

        function init(config){
            TagInput._config = createConfig(config);
        }
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
                    TagInput.config('allowedTagsPatternRegex').test(tag) &&
                    tag.length >= TagInput.config('minLength') &&
                    tag.length <= TagInput.config('maxLength')){
                    return pushTagFromText(tag);
                }
            } else if (angular.isArray(tag)) {
                for(var i=0; i<tag.length; i++){
                    if(!_pushTag(tag[i])){
                        return false;
                    }
                }
                return true;
            } else if(angular.isObject(tag)){
                return pushTag(tag);
            }
            return false;
        }
        function pushTagFromText(){
            var newTag = {};
            newTag[TagInput.config('displayProperty')] = text;
            newTag[TagInput.config('keyProperty')] = text;
            return pushTag(newTag);
        }
        function pushTag(tag){
            // check if allow more tags
            if(!TagInput.config('allowMoreThanMaxTags') && TagInput._tags.length >= TagInput._config.maxTags){
                return false;
            }
            // check if tags duplicate
            if(TagInput.getTagByKey(tag[TagInput.config('keyProperty')]) !== null){
                return false;
            }
            // push tag
            TagInput._tags.push(tag);
            // trigger event
            setTimeout(function(){this.trigger("onTagAdded", tag);}.bind(this));
            // return true
            return true;
        }

        function _popTag(tag){

        }
            popTag: function(idx){
                if(!angular.isDefined(idx)){
                    var tagRemoved = this._tags.pop();
                    if(tagRemoved !== undefined){
                        setTimeout(function(){this.trigger("onTagRemoved", tagRemoved);}.bind(this));
                        return tagRemoved;
                    }
                }else if(angular.isNumber(idx)){
                    if(idx >= 0){
                        var tagRemoved = this._tags.splice(idx, 1);
                        if(tagRemoved.length === 1){
                            setTimeout(function(){this.trigger("onTagRemoved", tagRemoved[0])}.bind(this));
                            return tagRemoved[0];
                        }
                    }
                }else if(angular.isObject(idx)){
                    var index = this._tags.indexOf(idx);
                    return this.popTag(index);
                }
                return null;
            },
            config: function(name, value){
                if (angular.isDefined(value)) {
                    this._config.set(name, value);
                }else if(angular.isString(name)){
                    return this._config[name];
                }else if(angular.isObject(name)){
                    this._config.extend(config);
                }else{
                    throw new Exception("Unsupported Operation");
                }
            },
            text: function(value){
                if(angular.isDefined(value)){
                    this._text.value = value;
                }else{
                    return this._text.value;
                }
            },
            getTags: function(){
                return this._tags;
            },
            getTagByKey: function(key){
                var keyProperty = this.config('keyProperty');
                for(var i=0; i<this._tags.length; i++){
                    if(this._tags[i][keyProperty] === key){
                        return this._tags[i];
                    }
                }
                return null;
            }
        });

        var _tagInputs = {};
        this.$get = function(){
            return this;
        };
        this.createTagInput = function(name, config){
            if (_tagInputs[name]) {
                console.error("ui-tag-input with identifier '" + name + "' exists before.");
                _tagInputs[name].extendConfig(config);
            }else{
                _tagInputs[name] = new TagInput(config);
            }
            return _tagInputs[name];
        };
        this.getTagInput = function(name){
            return (_tagInputs[name]) ? _tagInputs[name]: this.createTagInput(name, {});
        }
    }

})();
