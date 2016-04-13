angular.module('ui.taginput', [])
.provider('TagInputConfig', function(){
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
    var TagInput = Model({
        _tags: [],
        _text: {value: ''},
        init: function(config){
            this._config = new Config(config);
        },
        pushTag: function(tag){
            if (!angular.isDefined(tag)){
                if(this.text() !== ''){
                    return this.pushTag(this.text()) && !!this.text('');
                }
            } else if (angular.isString(tag)){
                if(tag !== '' &&
                   this.config('allowedTagsPatternRegex').test(tag) &&
                   tag.length >= this.config('minLength') &&
                   tag.length <= this.config('maxLength')){
                    var newTag = {};
                    newTag[this.config('displayProperty')] = tag;
                    newTag[this.config('keyProperty')] = tag;
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
                //check if allow more tags
                if(!this.config('allowMoreThanMaxTags') && this._tags.length >= this._config.maxTags){
                    return false;
                }
                //check if tags duplicate
                if(this.getTagByKey(tag[this.config('keyProperty')]) !== null){
                    return false;
                }
                //push tag
                this._tags.push(tag);
                //trigger event
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
});
