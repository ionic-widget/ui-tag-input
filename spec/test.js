Number.MAX_SAFE_INTEGER = 9007199254740991;

describe("Tag Input Configuration", function() {
    var TagInputConfig;

    beforeEach(function(){
        angular.module('test', [])
        .config(function(TagInputConfigProvider){
            TagInputConfig = TagInputConfigProvider;
        });
        module('ui.taginput', 'test');
        inject(function () {});
    });

    describe('default', function(){
        it("can inject TagInputConfig", function() {
            expect(TagInputConfig).not.toBeUndefined();
        });
        var testTag;
        it("can create tag", function(){
            testTag = TagInputConfig.createTagInput('test', {});
            expect(testTag).not.toBeUndefined();
        });
        it("can load default value", function(){
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
        it("can overwrite string config", function(){
            testTag.config("displayProperty", 0);
            expect(testTag.config('displayProperty')).toBe('value');
            testTag.config("displayProperty", false);
            expect(testTag.config('displayProperty')).toBe('value');
            testTag.config("displayProperty", 'test');
            expect(testTag.config('displayProperty')).toBe('test');
        })
    })
});
