(function(){
    'use strict';

    angular.module('ui.taginput')
        .directive('tagInput', TagInput);

    TagInput.$inject = ['$timeout', '$interpolate', 'TagInputConfig'];
    function TagInput($timeout, $interpolate, TagInputConfig){
        return {
            restrict: 'E',
            replace: true,
            require: 'ngModel',
            scope: {
                uiTagInputId: '@',
                tags: '=ngModel',
            },
            template: '<div class="item ui-tag-input" ng-click="onClick()" ng-class="tagInput.config(\'icon\') !== \'\' ? \'withIcon\' : \'\'">' +
                '<span ng-if="tagInput.config(\'icon\') !== \'\'" class="icon ion" ng-class="tagInput.config(\'icon\')"></span>' +
                '<tag-list ui-tag-input-id="{{::uiTagInputId}}"></tag-list>' +
                '<growing-input ui-tag-input-id="{{::uiTagInputId}}" on-input-blur="onInputBlur()" on-input-focus="onInputFocus()"></growing-input>' +
            '</div>',
            link: linkFn,
        };
        function linkFn($scope, $element, attrs, ngModelCtrl){
            var tagInput = TagInputConfig.getByHandle($scope.uiTagInputId);
            tagInput.config(attrs);
            var inputElement = $element.find("input")[0];
            var justClicked = false;
            $scope.tagInput = tagInput;
            $scope.onInputBlur = onInputBlur;
            $scope.onInputFocus = onInputFocus;
            $scope.onClick = onClick;
            var offTagAdded = tagInput.onTagAdded(onTagChanged);
            var offTagRemoved = tagInput.onTagRemoved(onTagChanged);

            if($scope.tags && $scope.tags.length > 0){
                ngModelCtrl.$setDirty();
                tagInput.pushTag($scope.tags);
            }
            setElementValidity();

            ngModelCtrl.$isEmpty = function(value) {
                return !value || !value.length;
            };

            ////////////////////
            $scope.$on('$destroy', function(){
                offTagAdded();
                offTagRemoved();
            });

            /////////////////////

            function onTagChanged(){
                //update ng-model
                $scope.tags = tagInput.getTags();
                //update scroll
                updateScroll();
                //set validity
                ngModelCtrl.$setDirty();
                setElementValidity();
                //disable or enable input text depends on config
                if(!tagInput.config('allowMoreThanMaxTags')){
                    disallowMoreTag();
                }
            }
            function setElementValidity(){
                ngModelCtrl.$setValidity('maxTags', tagInput.getTags().length <= tagInput.config('maxTags'));
                ngModelCtrl.$setValidity('minTags', tagInput.getTags().length >= tagInput.config('minTags'));
                ngModelCtrl.$validate();
            }

            function updateScroll(){
                $timeout(function(){
                    $element[0].scrollLeft = $element[0].scrollWidth;
                });
            }
            //add .ui-tag-full class if do not allow more than max tag
            function disallowMoreTag(){
                if(tagInput.getTags().length == tagInput.config("maxTags")){
                    $element.addClass('ui-tag-full');
                }else{
                    $element.removeClass('ui-tag-full');
                }
            }
            function onInputBlur(){
                if(!justClicked){
                    tagInput.pushTag();
                }
                justClicked = false;
            }
            function onInputFocus(){
                justClicked = false;
            }
            function onClick(){
                justClicked = true;
                $timeout(function(){
                    inputElement.focus();
                });
            }
        }
    }

})();
