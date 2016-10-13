Number.MAX_SAFE_INTEGER = 9007199254740991;

describe('TagInputConfig', function() {
    var TagInputConfig;

    var module = angular.mock.module;
    var inject = angular.mock.inject;
    var testTag;

    beforeEach(module('ui.taginput'));
    beforeEach(inject(function(_TagInputConfig_){
        TagInputConfig = _TagInputConfig_;
    }));

    beforeEach(function(){
        testTag = TagInputConfig.getByHandle('test');
    });

    afterEach(function(){
        TagInputConfig.removeHandle('test');
    });

    it("can inject TagInputConfig", function() {
        expect(TagInputConfig).not.toBeUndefined();
    });

    describe('config', function(){
        it('should load default configs', function() {
            expect(testTag.config('displayProperty')).toBe('value');
            expect(testTag.config('keyProperty')).toBe('value');
            expect(testTag.config('type')).toBe('text');
            expect(testTag.config('minLength')).toBe(0);
            expect(testTag.config('maxLength')).toBe(Number.MAX_SAFE_INTEGER);
            expect(testTag.config('minTags')).toBe(0);
            expect(testTag.config('maxTags')).toBe(Number.MAX_SAFE_INTEGER);
            expect(testTag.config('allowMoreThanMaxTags')).toBe(true);
            expect(testTag.config('placeholder')).toBe('');
            expect(testTag.config('icon')).toBe('');
            expect(testTag.config('addOnEnter')).toBe(true);
            expect(testTag.config('addOnSpace')).toBe(false);
            expect(testTag.config('addOnComma')).toBe(true);
            expect(testTag.config('addOnBlur')).toBe(true);
            expect(testTag.config('allowedTagsPattern')).toBe('.+');
            expect(testTag.config('enableEditingLastTag')).toBe(false);
        });
        it('should set configs', function(){
            testTag.config('displayProperty', 'test');
            expect(testTag.config('displayProperty')).toBe('test');
        });
        it('should not set non existance property', function(){
            testTag.config('nonExistProperty', 'test');
            expect(testTag.config('nonExistProperty')).toBeUndefined();
        });
        it('should update allowedTagsPatternRegex', function(){
            testTag.config('allowedTagsPattern', '\\\d\\\s\\\d+');
            expect(testTag.config('allowedTagsPattern')).toBe('\\\d\\\s\\\d+');
            expect(testTag.config('allowedTagsPatternRegex').toString()).toBe('\/\\\d\\\s\\\d+\/');
        });
        it('should set using objects', function(){
            testTag.config({
                allowedTagsPattern: '\\\d*',
                nonExistProperty: 'test',
                keyProperty: 'test',
            });
            expect(testTag.config('allowedTagsPattern')).toBe('\\\d*');
            expect(testTag.config('allowedTagsPatternRegex').toString()).toBe('\/\\\d*\/');
            expect(testTag.config('nonExistProperty')).toBeUndefined();
            expect(testTag.config('keyProperty')).toBe('test');
        });

        it('should throw', function(){
            expect(mightThrowWithArray).toThrow();
            expect(mightThrowWithNumbers).toThrow();

            function mightThrowWithArray(){
              testTag.config(['allowedTagsPattern', '\\\d*']);
            }
            function mightThrowWithNumbers(){
              testTag.config(1);
            }
        });
    });
    describe('text', function(){
        it('can read text', function(){
            expect(testTag._text).toBe('');
            expect(testTag.text()).toBe('');
            testTag._text = 'qwer';
            expect(testTag._text).toBe('qwer');
            expect(testTag.text()).toBe('qwer');
        });
        it('can update text', function(){
            expect(testTag._text).toBe('');
            testTag.text('asdf');
            expect(testTag._text).toBe('asdf');
        });
    });
    describe('get tag', function(){
        it('can get all the tags', function(){
            expect(testTag.getTags()).toEqual(testTag._tags);
            testTag.pushTag('asdf');
            expect(testTag.getTags()).toEqual(testTag._tags);
            testTag.pushTag('qwer');
            expect(testTag.getTags()).toEqual(testTag._tags);
            testTag.popTag('qwer');
            expect(testTag.getTags()).toEqual(testTag._tags);
        });
    });
    describe('push tags', function(){
        it('can push tag from text', function(){
            expect(testTag._tags).toEqual([]);
            expect(testTag._text).toBe('');
            expect(testTag.pushTag()).toBe(false);
            expect(testTag._tags).toEqual([]);
            expect(testTag._text).toBe('');

            testTag.text('asdf');
            expect(testTag.pushTag()).toBe(true);
            expect(testTag._tags.length).toEqual(1);
            expect(testTag._text).toBe('');
            expect(testTag._tags[0]).toEqual({ value: 'asdf' });
        });

        it('can push tag using text', function(){
            expect(testTag._tags).toEqual([]);
            expect(testTag.pushTag('qwer')).toBe(true);
            expect(testTag._tags.length).toEqual(1);
            expect(testTag._tags[0]).toEqual({ value: 'qwer' });
        });

        it('can push tag using object', function(){
            expect(testTag._tags).toEqual([]);
            expect(testTag.pushTag({ value: 'zxcv'})).toBe(true);
            expect(testTag._tags.length).toEqual(1);
            expect(testTag._tags[0]).toEqual({ value: 'zxcv' });
        });

        it('can push tag using array', function(){
            expect(testTag._tags).toEqual([]);
            expect(testTag.pushTag([{ value: 'zxcv'}, { value: 'wert'}, 'sdfg'])).toBe(true);
            expect(testTag._tags.length).toEqual(3);
            expect(testTag._tags[0]).toEqual({ value: 'zxcv' });
            expect(testTag._tags[1]).toEqual({ value: 'wert' });
            expect(testTag._tags[2]).toEqual({ value: 'sdfg' });
        });

        it('cannot push duplicate based on key property', function(){
            expect(testTag._tags).toEqual([]);
            expect(testTag.pushTag([{ value: 'zxcv'}, { value: 'zxcv'}, 'sdfg'])).toBe(false);
            expect(testTag._tags.length).toEqual(2);
            expect(testTag._tags[0]).toEqual({ value: 'zxcv' });
            expect(testTag._tags[1]).toEqual({ value: 'sdfg' });

            testTag.text('zxcv');
            expect(testTag.pushTag()).toBe(false);
            expect(testTag._tags.length).toEqual(2);
            expect(testTag._tags[0]).toEqual({ value: 'zxcv' });
            expect(testTag._tags[1]).toEqual({ value: 'sdfg' });
        });

        it('cannot push duplicate based on key property - allow if value is not keyproperty', function(){
            expect(testTag._tags).toEqual([]);
            expect(testTag.pushTag([{ test: 'zxcv', value: 1}, { test: 'zxcv', value: 2}, { test: 'sdfg', value: 3 }])).toBe(true);
            expect(testTag._tags.length).toEqual(3);
            expect(testTag._tags[0]).toEqual({ test: 'zxcv', value: 1 });
            expect(testTag._tags[1]).toEqual({ test: 'zxcv', value: 2 });;
            expect(testTag._tags[2]).toEqual({ test: 'sdfg', value: 3 });
        });

        it('should not push tags when not allowMoreThanMaxTags', function(){
            testTag.config('maxTags', 3);
            testTag.pushTag(['asdf', 'zxcv', 'qwer']);
            expect(testTag.getTags().length).toBe(3);
            expect(testTag.config('allowMoreThanMaxTags')).toBe(true);
            expect(testTag.pushTag('fdsa')).toBe(true);
            expect(testTag.getTags().length).toBe(4);

            testTag.config('allowMoreThanMaxTags', false);
            expect(testTag.pushTag('rewq')).toBe(false);
            expect(testTag.getTags().length).toBe(4);

            testTag.text('trew');
            expect(testTag.pushTag()).toBe(false);
            expect(testTag.getTags().length).toBe(4);

            expect(testTag.pushTag({value: 'ytre'})).toBe(false);
            expect(testTag.getTags().length).toBe(4);

            testTag.config('allowMoreThanMaxTags', true);
            expect(testTag.pushTag('rewq')).toBe(true);
            expect(testTag.getTags().length).toBe(5);
        });

        it('should not push tags if the text does not pass the requirement', function(){
            testTag.config('allowedTagsPattern', '\\\d+');
            expect(testTag.pushTag('asdf')).toBe(false);
            testTag.text('qwer');
            expect(testTag.pushTag()).toBe(false);

            expect(testTag.pushTag('123')).toBe(true);
            testTag.text('345');
            expect(testTag.pushTag()).toBe(true);

            testTag.config('minLength', 5);
            expect(testTag.pushTag('123')).toBe(false);
            testTag.text('345');
            expect(testTag.pushTag()).toBe(false);

            expect(testTag.pushTag('12345')).toBe(true);
            expect(testTag.pushTag('1234567890')).toBe(true);
            testTag.text('3456789012');
            expect(testTag.pushTag()).toBe(true);

            testTag.config('maxLength', 7);
            expect(testTag.pushTag('1234567890')).toBe(false);
            testTag.text('3456789012');
            expect(testTag.pushTag()).toBe(false);

            expect(testTag.pushTag('1234567')).toBe(true);
            testTag.text('3456789');
            expect(testTag.pushTag()).toBe(true);
        });

        it('should return false for unexpected parameter', function(){
            expect(testTag.pushTag(1)).toBe(false);
        });
    });

    describe('pop tags', function(){
        beforeEach(function(){
            testTag.pushTag(['asdf', 'zxcv', 'qwer']);
            expect(testTag._tags.length).toBe(3);
        });
        it('can pop tag', function(){
            expect(testTag.popTag()).toEqual({ value: 'qwer' });
            expect(testTag._tags.length).toBe(2);
            expect(testTag._tags[0]).toEqual({ value: 'asdf' });
            expect(testTag._tags[1]).toEqual({ value: 'zxcv' });
        });
        it('can pop tag by index', function(){
            expect(testTag.popTag(1)).toEqual({ value: 'zxcv' });
            expect(testTag._tags.length).toBe(2);
            expect(testTag._tags[0]).toEqual({ value: 'asdf' });
            expect(testTag._tags[1]).toEqual({ value: 'qwer' });
        });
        it('can pop tag by tag object', function(){
            var tag = testTag.getTagByKey('zxcv');
            expect(testTag.popTag(tag)).toEqual({ value: 'zxcv' });
            expect(testTag._tags.length).toBe(2);
            expect(testTag._tags[0]).toEqual({ value: 'asdf' });
            expect(testTag._tags[1]).toEqual({ value: 'qwer' });
        });
        it('should return null when pop tag that does not exist', function(){
            expect(testTag.popTag({value: 'reqw'})).toBeNull();
            expect(testTag._tags.length).toBe(3);
            expect(testTag._tags[0]).toEqual({ value: 'asdf' });
            expect(testTag._tags[1]).toEqual({ value: 'zxcv' });
            expect(testTag._tags[2]).toEqual({ value: 'qwer' });
        });
        it('should return null when pop by index out of range', function(){
            expect(testTag.popTag(-1)).toBeNull();
            expect(testTag._tags.length).toBe(3);
            expect(testTag._tags[0]).toEqual({ value: 'asdf' });
            expect(testTag._tags[1]).toEqual({ value: 'zxcv' });
            expect(testTag._tags[2]).toEqual({ value: 'qwer' });

            expect(testTag.popTag(4)).toBeNull();
            expect(testTag._tags.length).toBe(3);
            expect(testTag._tags[0]).toEqual({ value: 'asdf' });
            expect(testTag._tags[1]).toEqual({ value: 'zxcv' });
            expect(testTag._tags[2]).toEqual({ value: 'qwer' });

            expect(testTag.popTag(-3)).toBeNull();
            expect(testTag._tags.length).toBe(3);
            expect(testTag._tags[0]).toEqual({ value: 'asdf' });
            expect(testTag._tags[1]).toEqual({ value: 'zxcv' });
            expect(testTag._tags[2]).toEqual({ value: 'qwer' });

            expect(testTag.popTag(20)).toBeNull();
            expect(testTag._tags.length).toBe(3);
            expect(testTag._tags[0]).toEqual({ value: 'asdf' });
            expect(testTag._tags[1]).toEqual({ value: 'zxcv' });
            expect(testTag._tags[2]).toEqual({ value: 'qwer' });
        });
    });
    describe('displayTag', function(){
        it('should display tag based on displayProperty', function(){
            var tag = {
                value: 'uitag',
                name: 'is',
                display: 'cool',
            };
            expect(testTag.config('displayProperty')).toEqual('value');
            expect(testTag.displayTag(tag)).toEqual('uitag');
            testTag.config('displayProperty', 'name');
            expect(testTag.displayTag(tag)).toEqual('is');
            testTag.config('displayProperty', 'display');
            expect(testTag.displayTag(tag)).toEqual('cool');
        });
    });

});
