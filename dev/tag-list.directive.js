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
