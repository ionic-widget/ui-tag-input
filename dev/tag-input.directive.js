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
            template: '<div class="item ui-tag-input">' +
                '<tag-list ui-tag-input-id="{{::uiTagInputId}}"></tag-list>' +
                '<growing-input ui-tag-input-id="{{::uiTagInputId}}"></growing-input>' +
            '</div>',
            compile: function(element, attrs){
                TagInputConfig.getByHandle(attrs.uiTagInputId).config(attrs);
                return linkFn;
            },
        };
        function linkFn($scope, $element, attrs, ngModelCtrl){
            var tagInput = TagInputConfig.getByHandle($scope.uiTagInputId);
            var inputElement = $element.find("input")[0];

            //add icon if needed
            if(tagInput.config('icon') !== ''){
                var interpolatedIcon = $interpolate('<span class="icon ion {{icon}} "></span>')({ icon: tagInput.config('icon') });
                $element.prepend(angular.element(interpolatedIcon));
                $element.addClass('withIcon');
            }

            $element.bind("click", function(event){
                if(event.target == $element[0]){
                    $timeout(function(){
                        inputElement.focus();
                    });
                }
            });

            ngModelCtrl.$isEmpty = function(value) {
                return !value || !value.length;
            };

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

            tagInput.onTagAdded(onTagChanged);
            tagInput.onTagRemoved(onTagChanged);

            if($scope.tags && $scope.tags.length > 0){
                ngModelCtrl.$setDirty();
                $scope.tags.forEach(function(tag){
                    tagInput.pushTag(tag);
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
            setElementValidity();
        }
    }

})();
