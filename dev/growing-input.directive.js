(function(){
    'use strict';

    angular.module('ui.taginput')
        .directive('growingInput', uiGrowingInput);

    uiGrowingInput.$inject = ['TagInputConfig', '$timeout'];
    function uiGrowingInput(TagInputConfig, $timeout) {
        // key constant
        var KEY_BACKSPACE = 8,
            KEY_DELETE = 46,
            KEY_ENTER = 13,
            KEY_SPACE = 32,
            KEY_COMMA = 188;

        return {
            restrict: 'E',
            scope: {
                uiTagInputId: '@',
                onInputBlur: '&',
                onInputFocus: '&',
            },
            template:
                '<div class="growingInput">' +
                    '<input ' +
                        'type="text" ' +
                        'placeholder="{{::placeholder}}" ' +
                        'type="{{::inputType}}" ' +
                        'ng-keydown="onKeyDown($event)" ' +
                        'ng-change="onInputChanged()" ' +
                        'ng-blur="onInputBlur()" ' +
                        'ng-focus="onInputFocus()" ' +
                        'ng-model="tagInput._text">' +
                    '<span class="hiddenText">{{tagInput._text || placeholder}}</span>' +
                '</div>',
            link: link,
        };

        function link(scope, elem){
            var tagInputId = scope.uiTagInputId;
            var inputElement = elem.find("input");
            var spanElement = elem.find("span");

            ////////////////////
            var tagInput = TagInputConfig.getByHandle(tagInputId);
            scope.tagInput = tagInput;
            scope.placeholder = tagInput.config("placeholder");
            scope.inputType = tagInput.config("type");
            scope.onInputChanged = onInputChanged;
            scope.onKeyDown = onKeyDown;

            //disable or enable input text depends on config
            if(!tagInput.config('allowMoreThanMaxTags')){
                var offTagAdded = tagInput.onTagAdded(disallowMoreTag);
                var offTagRemoved = tagInput.onTagRemoved(disallowMoreTag);
                scope.$on('$destroy', function(){
                    offTagAdded();
                    offTagRemoved();
                });
            }

            function onInputChanged(){
                //update width accordingly
                var width = spanElement.width() + 20;
                inputElement.css('width', width + 'px');
                //remove error
                inputElement.removeClass('error');
            }

            function onKeyDown(event) {
                var key = event.which;
                if(key === KEY_BACKSPACE || key === KEY_DELETE){
                    if(getCaret(inputElement[0]) === 0){
                        var tagRemoved = tagInput.popTag();
                        //If enable edit last tag
                        if(tagRemoved !== null && tagInput.config('enableEditingLastTag')){
                            var tagText = tagRemoved[tagInput.config('displayProperty')];
                            tagInput.text( tagText + tagInput.text());
                            // $timeout(function() {
                                setCaret(inputElement[0], tagText.length);
                            // });
                        }
                        event.preventDefault();
                    }
                } else if((key === KEY_ENTER && tagInput.config('addOnEnter')) ||
                        (key === KEY_SPACE && tagInput.config('addOnSpace')) ||
                        (key === KEY_COMMA && tagInput.config('addOnComma'))) {
                    pushTagAtCaret();
                    event.preventDefault();
                }
            }
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

            function disallowMoreTag(){
                if(tagInput.getTags().length == tagInput.config("maxTags")){
                    inputElement.blur();
                    inputElement.attr('disabled', 'disabled');
                    inputElement.addClass('ui-tag-hide');
                }else{
                    inputElement.removeAttr('disabled');
                    inputElement.removeClass('ui-tag-hide');
                }
            }
        }
    }
})();
