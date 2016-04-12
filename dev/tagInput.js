angular.module('ui.taginput')
.directive('tagInput', function($timeout, $interpolate, TagInputConfig){
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
            TagInputConfig.createTagInput(attrs.uiTagInputId, attrs);
            return linkFn;
        },
    };
    function linkFn($scope, $element, attrs, ngModelCtrl){
        var tagInput = TagInputConfig.getTagInput($scope.uiTagInputId);
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
            $scope.tags = tagInput.getTags();
            updateScroll();
            ngModelCtrl.$setDirty();
            setElementValidity();
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

        tagInput.on('onTagAdded', onTagChanged)
                .on('onTagRemoved', onTagChanged);

        if($scope.tags && $scope.tags.length > 0){
            ngModelCtrl.$setDirty();
            $scope.tags.forEach(function(tag){
                tagInput.pushTag(tag);
            });
        }
        setElementValidity();
    }
})
.directive('tagList', function(TagInputConfig, $interpolate) {
    return {
        restrict: 'E',
        template: '<div class="tag-container">' +
                  '</div>',
        link: {
            pre: function($scope, $elem, $attr){
                var tagInputId = $attr.uiTagInputId;
                var tagInput = TagInputConfig.getTagInput(tagInputId);
                var tagContainer = $elem.find('.tag-container');
                var tags = {};

                tagInput.on('onTagAdded', function addTag(tag){
                    var interpolated = $interpolate('<pill class="ui-tag-input-pill">{{name}} <i class="ion-close-round"></i></pill>')({name: getDisplay(tag)});
                    var pill = angular.element(interpolated);
                    tags[JSON.stringify(tag)] = pill;
                    tagContainer.append(pill);
                    pill.on('click', removeTag.bind(tag));
                });
                tagInput.on('onTagRemoved', function removeTag(tag){
                    var tagElem = tags[JSON.stringify(tag)];
                    tagElem.off('click');
                    tagElem.remove();
                    delete tagElem;
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
})
.directive('growingInput', function(TagInputConfig, $timeout) {
    return {
        restrict: 'E',
        template:
            '<div class="growingInput">' +
                '<input type="text" placeholder="{{placeholder}}" ng-model="text.value">' +
                '<span class="hiddenText">{{text.value || placeholder}}</span>' +
            '</div>',
        link: function ($scope, $element, $attr){
            var tagInputId = $attr.uiTagInputId;
            var inputElement = $element.find("input");
            var spanElement = $element.find("span");
            var tagInput = TagInputConfig.getTagInput(tagInputId);
            $scope.placeholder = tagInput.config("placeholder");
            $scope.text = tagInput._text;

            $scope.$watch("text.value", function(){
                //update width accordingly
                var width = spanElement.width() + 20;
                inputElement.css('width', width + 'px');
                //remove error
                inputElement.removeClass('error');
            });
            inputElement.on('blur', function(){
                //TODO blur will trigger event when click to delete tag
                $timeout(tagInput.pushTag);
            });
            angular.element(inputElement).bind("keydown keypress", function(event) {
                switch(event.which){
                    case 8:  //backspace
                    case 46: //delete
                        if(getCaret(inputElement[0]) === 0){
                            $timeout(function(){
                                var tagRemoved = tagInput.popTag();
                                //If enable edit last tag
                                if(tagRemoved !== null && tagInput.config('enableEditingLastTag')){
                                    var tagText = tagRemoved[tagInput.config('displayProperty')];
                                    tagInput.text( tagText + tagInput.text());
                                    $timeout(function() {
                                        setCaret(inputElement[0], tagText.length);
                                    });
                                }
                            });
                            event.preventDefault();
                        }
                        break;
                    case 13: //enter
                        if(tagInput.config('addOnEnter')){
                            pushTagAtCaret();
                            event.preventDefault();
                        }
                        break;
                    case 32: //space
                        if(tagInput.config('addOnSpace')){
                            pushTagAtCaret();
                            event.preventDefault();
                        }
                        break;
                    case 188: //comma
                        if(tagInput.config('addOnComma')){
                            pushTagAtCaret();
                            event.preventDefault();
                        }
                        break;
                }
            });
            //create a tag for text infront of the caret
            function pushTagAtCaret(){
                var caret = getCaret(inputElement[0]);
                var text = tagInput.text();
                var subtext = text.substring(0, caret);
                $timeout(function(){
                    if(tagInput.pushTag(subtext)){
                        tagInput.text(text.substring(caret));
                        $timeout(function(){
                            setCaret(inputElement[0], 0);
                        });
                    }else{
                        //failed to create tag
                        inputElement.addClass('error');
                    }
                });
            }
            function getCaret(e){
                return (e.selectionStart === e.selectionEnd) ? e.selectionStart : -1;
            }
            function setCaret(e, pos){
                e.setSelectionRange(pos, pos);
            }

            //disable or enable input text depends on config
            if(!tagInput.config('allowMoreThanMaxTags')){
                tagInput.on('onTagAdded', disallowMoreTag)
                        .on('onTagRemoved', disallowMoreTag);
            }
            function disallowMoreTag(){
                if(tagInput.getTags().length == tagInput.config("maxTags")){
                    inputElement.blur();
                    inputElement.attr('disabled', 'disabled');
                    inputElement.addClass('hide');
                }else{
                    inputElement.removeAttr('disabled');
                    inputElement.removeClass('hide');
                }
            }
        }
    };
});
