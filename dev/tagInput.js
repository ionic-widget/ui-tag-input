angular.module('ui.taginput')
.directive('tagInput', function($timeout, tagInputConfig){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            uiTagInputId: '@',
        },
        template: '<div class="item secondary-search-bar category-search-bar">' +
            '<span class="icon ion {{::tagInput.config(\'icon\')}} "></span>' +
            '<tag-list ui-tag-input-id="{{::uiTagInputId}}"></tag-list>' +
            '<growing-input ui-tag-input-id="{{::uiTagInputId}}" input-model="inputModel"></growing-input>' +
        '</div>',
        compile: function(element, attrs){
            tagInputConfig.createTagInput(attrs.uiTagInputId, attrs);
            return linkFn;
        }
    };
    function linkFn($scope, $element){
        $scope.tagInput = tagInputConfig.getTagInput($scope.uiTagInputId);
        var inputElement = $element.find("input")[0];

        $element.bind("click", function(event){
            if(event.target == $element[0]){
                $timeout(function(){
                    inputElement.focus();
                });
            }
        });
        angular.element(inputElement).bind("keydown keypress", function(event) {
            if($scope.tagInput.text() === ""){
                if(event.keyCode === 8 || event.keyCode === 46) {
                    $timeout(function(){
                        $scope.tagInput.popTag();
                    });
                    event.preventDefault();
                }
            }
        });
        $scope.$watch("tags.length", function(){
            $timeout(function(){
                $element[0].scrollLeft = $element[0].scrollWidth;
            });
        });
    }
})
.directive('tagList', function(tagInputConfig) {
    return {
        restrict: 'E',
        scope: {
            uiTagInputId: '@',
        },
        template: '<div class="tag-container">' +
                      '<pill ng-repeat="(idx, tag) in tags" ng-click="removeTag(idx)" class="category-pill">{{ getDisplay(tag) }} <i class="ion-close-round"></i></pill>' +
                  '</div>',
        link: function($scope){
            $scope.getDisplay = function(val){
                return val[tagInputConfig.getTagInput($scope.uiTagInputId).config('displayProperty')];
            };
            $scope.removeTag = function(idx){
                if(idx >= 0){
                    $scope.tags.splice(idx, 1);
                }
            };
            $scope.tags = tagInputConfig.getTagInput($scope.uiTagInputId).getTags();
        }
    };
})
.directive('growingInput', function(tagInputConfig) {
    return {
        restrict: 'E',
        scope: {
            uiTagInputId: '@',
            inputModel: '=',
        },
        template:
            '<div class="growingInput">' +
                '<input type="text" placeholder="{{placeholder}}" ng-model="text.value">' +
                '<span class="hiddenText">{{inputModel.value || placeholder}}</span>' +
            '</div>',
        link: function ($scope, $element){
            var inputElement = $element.find("input");
            var spanElement = $element.find("span");
            var tagInput = tagInputConfig.getTagInput($scope.uiTagInputId);
            $scope.$watch("inputModel.value", function(){
                var width = spanElement.width() + 20;
                inputElement.css('width', width + 'px');
            });

            $scope.placeholder = tagInput.config("placeholder");
            $scope.text = tagInput._text;
        }
    }
});
