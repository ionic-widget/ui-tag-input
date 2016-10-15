describe('GrowingInput', function() {
  var GrowingInput;

  var module = angular.mock.module;
  var inject = angular.mock.inject;
  var testTag, growingInput, $rootScope, $scope, $sniffer, $timeout;

  var template = '<growing-input ui-tag-input-id="test" on-input-blur="data.onInputBlur()" on-input-focus="data.onInputFocus()"></growing-input>';

  beforeEach(module('ui.taginput'));
  beforeEach(inject(function(_TagInputConfig_, _$rootScope_, $compile, $document, _$sniffer_, _$timeout_){
    TagInputConfig = _TagInputConfig_;
    $rootScope = _$rootScope_;
    $sniffer = _$sniffer_;
    $timeout = _$timeout_;
    $scope = $rootScope.$new();
    //
    $scope.data = {
      onInputBlur: jasmine.createSpy('inputBlur'),
      onInputFocus: jasmine.createSpy('inputFocus'),
    };
    var precompiled = angular.element(template);
    growingInput = $compile(precompiled)($scope);
    $document.find('body').append(growingInput);
    $rootScope.$apply();
  }));

  beforeEach(function(){
    testTag = TagInputConfig.getByHandle('test');
  });

  afterEach(function(){
    TagInputConfig.removeHandle('test');
    if(growingInput) growingInput.remove();
  });

  describe('scope', function(){
    it('should load correct scope', function() {
      var directiveScope = growingInput.isolateScope();
      expect(directiveScope.uiTagInputId).toEqual('test');
      directiveScope.onInputBlur();
      expect($scope.data.onInputBlur).toHaveBeenCalled();
      directiveScope.onInputFocus();
      expect($scope.data.onInputFocus).toHaveBeenCalled();
    });
  });

  describe('growing', function(){
    it('should expand', function() {
      var input = $(growingInput).find('input');
      var width = input.width();
      type(input, 'this is a very long long long long sentence. wish it grows');
      expect(input.width()).toBeGreaterThan(width);
    });

    it('should shrink', function() {
      var input = $(growingInput).find('input');
      type(input, 'this is a very long long long long sentence. wish it grows');
      var width = input.width();
      type(input, 'short');
      expect(input.width()).toBeLessThan(width);
    });

    it('should never be shorter than 20px', function() {
      var input = $(growingInput).find('input');
      type(input, 'this is a very long long long long sentence. wish it grows');
      expect(input.width()).toBeGreaterThan(20);
      type(input, '');
      expect(input.width()).toBeGreaterThan(20);
    });
  });

  describe('key down to add', function(){
    beforeEach(function(){
      spyOn(testTag, 'pushTag').and.callThrough();
    });
    it('should add on enter', function(){
      var input = $(growingInput).find('input');
      type(input, 'tag1');
      setCaret(input, 4);
      triggerKeyDown(input, 13);
      $timeout.flush();
      expect(testTag.pushTag).toHaveBeenCalledWith('tag1');
    });
    it('should not add on enter', function(){
      testTag.config('addOnEnter', false);
      $rootScope.$apply();
      var input = $(growingInput).find('input');
      type(input, 'tag1');
      setCaret(input, 4);
      triggerKeyDown(input, 13);
      $timeout.flush();
      expect(testTag.pushTag).not.toHaveBeenCalled();
    });

    it('should add on space', function(){
      testTag.config('addOnSpace', true);
      $rootScope.$apply();
      var input = $(growingInput).find('input');
      type(input, 'tag1');
      setCaret(input, 4);
      triggerKeyDown(input, 32);
      $timeout.flush();
      expect(testTag.pushTag).toHaveBeenCalledWith('tag1');
    });
    it('should not add on space', function(){
      testTag.config('addOnSpace', false);
      $rootScope.$apply();
      var input = $(growingInput).find('input');
      type(input, 'tag1');
      setCaret(input, 4);
      triggerKeyDown(input, 32);
      $timeout.flush();
      expect(testTag.pushTag).not.toHaveBeenCalled();
    });

    it('should add on comma', function(){
      testTag.config('addOnComma', true);
      $rootScope.$apply();
      var input = $(growingInput).find('input');
      type(input, 'tag1');
      setCaret(input, 4);
      triggerKeyDown(input, 188);
      $timeout.flush();
      expect(testTag.pushTag).toHaveBeenCalledWith('tag1');
    });
    it('should not add on space', function(){
      testTag.config('addOnComma', false);
      $rootScope.$apply();
      var input = $(growingInput).find('input');
      type(input, 'tag1');
      setCaret(input, 4);
      triggerKeyDown(input, 188);
      $timeout.flush();
      expect(testTag.pushTag).not.toHaveBeenCalled();
    });

    it('should prevent event', function(){
      var input = $(growingInput).find('input');
      var spyEvent = spyOnEvent(input, 'keydown');

      spyEvent.reset();
      testTag.config('addOnEnter', false);
      $rootScope.$apply();
      triggerKeyDown(input, 13);
      expect(spyEvent).not.toHaveBeenPrevented();

      spyEvent.reset();
      testTag.config('addOnEnter', true);
      $rootScope.$apply();
      triggerKeyDown(input, 13);
      expect(spyEvent).toHaveBeenPrevented();

      spyEvent.reset();
      testTag.config('addOnSpace', false);
      $rootScope.$apply();
      triggerKeyDown(input, 32);
      expect(spyEvent).not.toHaveBeenPrevented();

      spyEvent.reset();
      testTag.config('addOnSpace', true);
      $rootScope.$apply();
      triggerKeyDown(input, 32);
      expect(spyEvent).toHaveBeenPrevented();

      spyEvent.reset();
      testTag.config('addOnComma', false);
      $rootScope.$apply();
      triggerKeyDown(input, 188);
      expect(spyEvent).not.toHaveBeenPrevented();

      spyEvent.reset();
      testTag.config('addOnComma', true);
      $rootScope.$apply();
      triggerKeyDown(input, 188);
      expect(spyEvent).toHaveBeenPrevented();
    });
  });

  describe('key down to delete', function(){
    it('')
  });

  function type(input, str){
    for (var i = 1; i <= str.length; i++) {
      input.val(str.substr(0, i));
      input.trigger($sniffer.hasEvent('input') ? 'input' : 'change');
    }
  }
  function triggerKeyDown(element, keyCode) {
    var e = $.Event("keydown");
    e.which = keyCode;
    element.trigger(e);
  }
  function setCaret(element, pos){
    element[0].setSelectionRange(pos, pos);
  }
  function getCaret(element){
    return element[0].selectionStart;
  }
});
