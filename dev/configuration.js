angular.module('ui.taginput', [])
.provider('tagInputConfig', function(){
    var defaultConfig = {
        'displayProperty': {type: String, default: 'value'},
        'minTags': {type: Number, default: 0},
        'maxTags': {type: Number, default: Number.MAX_SAFE_INTEGER},
        'placeholder': {type: String, default: ''},
        'icon': {type: String, default: undefined },
    }
    /*
        Config Class
    */
    var Config = function(config){
        for(var c in defaultConfig){
            this[c] = clean(defaultConfig[c].type, config[c]) || defaultConfig[c].default;
        }
    }
    /*
        Public Config methods
    */
    Config.prototype.extend = function(config){
        for(var c in defaultConfig){
            this[c] = clean(defaultConfig[c].type, config[c]) || this[c];
        }
    };
    /*
        private Config methods
    */
    function clean(type, value){
        if(type === String){
            return angular.isString(value) ? value : null;
        }else if(type === Number){
            return (/^\d+$/.test(value)) ? parseInt(value) : null;
        }else if(type === Array){
            return (angular.isArray(value)) ? value : null;
        }else{
            return null;
        }
    }

    /*
        TagInput Class
    */
    var TagInput = function(config){
        this._tags = [];
        this._text = {value: ''};
        this._config = new Config(config);
    };
    TagInput.prototype.extendConfig = function(config){
        this._config.extend(config);
    };
    TagInput.prototype.pushTag = function(tag){
        if (angular.isArray(tag)) {
            for(var i=0; i<tag.length; i++){
                if(this._tags.length >= this._config.maxTags){
                    return false;
                }
                this._tags.push(tag[i]);
            }
        }else if(angular.isObject(tag)){
            if(this._tags.length >= this._config.maxTags){
                return false;
            }
            this._tags.push(tag);
        }
        return true;
    };
    TagInput.prototype.popTag = function(){
        return this._tags.pop() !== undefined;
    }
    TagInput.prototype.config = function(name, value){
        if (angular.isDefined(value)) {
            this._config.extend({[name]: value});
        }else{
            return this._config[name];
        }
    }
    TagInput.prototype.text = function(value){
        if(angular.isDefined(value)){
            this._text.value = value;
        }else{
            return this._text.value;
        }
    }
    TagInput.prototype.getTags = function(){
        return this._tags;
    }

    var _tagInputs = {};

    this.$get = function(){
        return this;
    };
    this.createTagInput = function(name, config){
        if (_tagInputs[name]) {
            console.error("ui-tag-input with identifier '" + name + "' exists before. The config will be replaced");
        }
        _tagInputs[name] = new TagInput(config);
    };
    this.getTagInput = function(name){
        return _tagInputs[name];
    }
});
