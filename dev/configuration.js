angular.module('ui.taginput', [])
.provider('tagInputConfig', function(){
    // var Model = require("./fishbone");
    var defaultConfig = {
        'displayProperty': {type: String, default: 'value'},
        'minTags': {type: Number, default: 0},
        'maxTags': {type: Number, default: Number.MAX_SAFE_INTEGER},
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
    /*
        Config Class
    */
    var Config = Model({
        init: function(config){
            for(var c in defaultConfig){
                this[c] = clean(defaultConfig[c].type, config[c]) || defaultConfig[c].default;
            }
            this.allowedTagsPatternRegex = new RegExp(this.allowedTagsPattern);
        },
        extend: function(config){
            for(var c in defaultConfig){
                this[c] = clean(defaultConfig[c].type, config[c]) || this[c];
            }
            this.allowedTagsPatternRegex = new RegExp(this.allowedTagsPattern);
        },
        set: function(name, value){
            if(name in this){
                this[name] = clean(defaultConfig[name].type, value) || this[name];
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
    cleanFn[String] = function(value){ return angular.isString(value) ? value : null; };
    cleanFn[Number] = function(value){ return (/^\d+$/.test(value)) ? parseInt(value) : null; };
    cleanFn[Array] = function(value){ return (angular.isArray(value)) ? value : null; };
    cleanFn[Boolean] = function(value){ return (value === true || value === false) ? value : (angular.isString(value) && value === 'true'); };
    function clean(type, value){
        if(cleanFn[type]){
            return cleanFn[type](value);
        }else{
            return null;
        }
    }

    /*
        TagInput Class
    */
    var TagInput = Model({
        _tags: [],
        _text: {value: ''},
        init: function(config){
            this._config = new Config(config);
        },
        extendConfig: function(config){
            this._config.extend(config);
        },
        pushTag: function(tag){
            if (!angular.isDefined(tag)){
                if(this.text() !== ''){
                    return this.pushTag(this.text()) && !!this.text('');
                }
            } else if (angular.isString(tag)){
                if(tag !== '' && this.config('allowedTagsPatternRegex').test(tag)){
                    var newTag = {};
                    newTag[this.config('displayProperty')] = tag;
                    if(this.pushTag(newTag)){
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return false;
                }
            } else if (angular.isArray(tag)) {
                for(var i=0; i<tag.length; i++){
                    if(!this.pushTag(tag[i])){
                        return false;
                    }
                }
            }else if(angular.isObject(tag)){
                if(this._tags.length >= this._config.maxTags){
                    return false;
                }
                this._tags.push(tag);
                setTimeout(function(){this.trigger("onTagAdded", tag);}.bind(this));
            }else{
                return false;
            }
            return true;
        },
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
            }else{
                return this._config[name];
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
});
