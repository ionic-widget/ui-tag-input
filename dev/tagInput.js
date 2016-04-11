angular.module('ui.taginput')
.directive('tagInput', function($timeout, $interpolate, TagInputConfig){
    return {
        restrict: 'E',
        replace: true,
        scope: {
            uiTagInputId: '@',
        },
        template: '<div class="item ui-tag-input">' +
            '<tag-list ui-tag-input-id="{{::uiTagInputId}}"></tag-list>' +
            '<growing-input ui-tag-input-id="{{::uiTagInputId}}"></growing-input>' +
        '</div>',
        compile: function(element, attrs){
            TagInputConfig.createTagInput(attrs.uiTagInputId, attrs);
            return linkFn;
        }
    };
    function linkFn($scope, $element){
        var tagInput = TagInputConfig.getTagInput($scope.uiTagInputId);
        var inputElement = $element.find("input")[0];

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
        $scope.$watch("tags.length", function(){
            $timeout(function(){
                $element[0].scrollLeft = $element[0].scrollWidth;
            });
        });
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
                    var interpolated = $interpolate('<pill class="category-pill">{{name}} <i class="ion-close-round"></i></pill>')({name: getDisplay(tag)});
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
                var width = spanElement.width() + 20;
                inputElement.css('width', width + 'px');
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
                    }
                });
            }
            function getCaret(e){
                return (e.selectionStart === e.selectionEnd) ? e.selectionStart : -1;
            }
            function setCaret(e, pos){
                e.setSelectionRange(pos, pos);
            }
        }
    };
});
