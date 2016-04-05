angular.module('ui.taginput', [])
.directive('tagInput', function($timeout){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            tags: '=',
            inputModel: '=',
            placeholder: '@',
            icon: '@',
        },
        template: '<div class="item secondary-search-bar category-search-bar">' +
            '<span class="icon ion {{icon}}"></span>' +
            '<tag-list tags="tags"></tag-list>' +
            '<growing-input placeholder="{{placeholder}}" input-model="inputModel"></growing-input' +
        '</div>',
        link: function($scope, $element){
            var inputElement = $element.find("input")[0];

            $element.bind("click", function(event){
                if(event.target == $element[0]){
                    $timeout(function(){
                        inputElement.focus();
                    });
                }
            });
            angular.element(inputElement).bind("keydown keypress", function(event) {
                if($scope.inputModel.value === ""){
                    if(event.keyCode === 8 || event.keyCode === 46) {
                        $scope.tags.pop();
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
    };
})
.directive('tagList', function() {
    return {
        restrict: 'E',
        scope: { tags: '=' },
        template: '<div class="tag-container">' +
                      '<pill ng-repeat="(idx, tag) in tags" ng-click="removeTag(idx)" class="category-pill">{{ tag.value }} <i class="ion-close-round"></i></pill>' +
                  '</div>',
        link: function($scope){
            $scope.removeTag = function(idx){
                if(idx >= 0){
                    $scope.tags.splice(idx, 1);
                }
            };
            $scope.removeTag();
        }
    };
})
.directive('growingInput', function() {
    return {
        restrict: 'E',
        scope: {
            placeholder: '@',
            inputModel: '=',
        },
        template:
            '<div class="growingInput">' +
                '<input type="text" placeholder="{{placeholder}}" ng-model="inputModel.value">' +
                '<span class="hiddenText">{{inputModel.value || placeholder}}</span>' +
            '</div>',
        link: function ($scope, $element){
            var inputElement = $element.find("input");
            var spanElement = $element.find("span");

            $scope.$watch("inputModel.value", function(){
                var width = spanElement.width() + 20;
                inputElement.css('width', width + 'px');
            });
        }
    }
});
