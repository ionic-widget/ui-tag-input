describe('TagList', function() {
    var TagInputConfig;

    var module = angular.mock.module;
    var inject = angular.mock.inject;
    var tagList, tagInput, pills;
    var $compile, $scope, $rootScope;

    beforeEach(module('ui.taginput'));
    beforeEach(inject(function($compile, _$rootScope_, TagInputConfig){
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        var precompiled = angular.element('<tag-list ui-tag-input-id="test"></tag-list>');
        tagList = $compile(precompiled)($scope);
        tagInput = TagInputConfig.getByHandle('test');

        angular.element(document).find('body').append(tagList);
        $rootScope.$apply();
    }));

    afterEach(function(){
        tagList.remove();
    });

    it('should have new tag when added', function(){
        expect(tagList.find('pill')).toHaveLength(0);
        // add tag
        tagInput.pushTag('asdf');
        $rootScope.$apply();
        // expect
        pills = tagList.find('pill');
        expect(pills).toHaveLength(1);
        expect(pills.eq(0)).toContainText('asdf');
        // add more tag
        tagInput.pushTag('qwer');
        $rootScope.$apply();
        // expect
        pills = tagList.find('pill');
        expect(pills).toHaveLength(2);
        expect(pills.eq(0)).toContainText('asdf');
        expect(pills.eq(1)).toContainText('qwer');
    });

    it('should remove tag when removed', function(){
        tagInput.pushTag(['asdf', 'qwer']);
        $rootScope.$apply();
        pills = tagList.find('pill');
        expect(pills).toHaveLength(2);
        // remove tag
        tagInput.popTag();
        $rootScope.$apply();
        // expect
        pills = tagList.find('pill');
        expect(pills).toHaveLength(1);
        expect(pills.eq(0)).toContainText('asdf');
    });

    it('should remove tag when clicked', function(){
        spyOn(tagInput, 'popTag').and.callThrough();
        tagInput.pushTag(['asdf', 'qwer', 'zxcv']);
        $rootScope.$apply();
        pills = tagList.find('pill');
        expect(pills).toHaveLength(3);
        // click the second pill
        pills.eq(1).click();
        expect(tagInput.popTag).toHaveBeenCalledWith(jasmine.objectContaining({ value: 'qwer' }));
        $rootScope.$apply();
        pills = tagList.find('pill');
        expect(pills).toHaveLength(2);
        expect(pills.eq(0)).toContainText('asdf');
        expect(pills.eq(1)).toContainText('zxcv');
        expect(tagInput.getTags().length).toBe(2);
    });
});
