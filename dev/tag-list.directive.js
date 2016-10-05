(function(){
    'use strict';

    angular.module('ui.taginput')
        .directive('tagList', uiTagList);

    uiTagList.$inject = ['TagInputConfig', '$interpolate'];
    function uiTagList(TagInputConfig, $interpolate) {
        return {
            restrict: 'E',
            template: '<div class="tag-container"></div>',
            link: {
                pre: function($scope, $elem, $attr){
                    var tagInputId = $attr.uiTagInputId;
                    var tagInput = TagInputConfig.getTagInput(tagInputId);
                    var tagContainer = $elem.find('.tag-container');
                    var tags = {};

                    tagInput.on('onTagAdded', addTag);

                    function addTag(tag){
                        var interpolated = $interpolate('<pill class="ui-tag-input-pill">{{name}} <i class="ion-close-round"></i></pill>')({name: getDisplay(tag)});
                        var pill = angular.element(interpolated);
                        tags[JSON.stringify(tag)] = pill;
                        tagContainer.append(pill);
                        pill.on('click', removeTag.bind(tag));
                    }
                    tagInput.on('onTagRemoved', function removeTag(tag){
                        var tagElem = tags[JSON.stringify(tag)];
                        tagElem.off('click');
                        tagElem.remove();
                    });
                    function removeTag(event){
                        tagInput.popTag(this);
                    };
                    function getDisplay(val){
                        return val[tagInput.config('displayProperty')];
                    };
                }
            },
        };
    }
})();
