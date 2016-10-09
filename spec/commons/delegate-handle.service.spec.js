(function() {
    'use strict';

    describe('delegate-handle.service', function() {

        var module = angular.mock.module;
        var inject = angular.mock.inject;

        function Mock(){
            return { test: 'lhcommons' };
        }

        beforeEach(module('lh.commons.util', function($provide){
            $provide.factory('lhMock', Mock);
        }));

        beforeEach(module('lh.commons.util'));

        describe('DelegateHandle.create', function(){
            var injectedMock;
            var delegateHandle;

            TestObject.$inject = ['lhMock'];
            function TestObject(lhMock) { injectedMock = lhMock; }

            beforeEach(inject(function(DelegateHandle){
                delegateHandle = DelegateHandle.create(TestObject, 'test');
            }))

            it('should generate handle with the prefix', function(){
                expect(delegateHandle.generateHandle()).toEqual(jasmine.stringMatching(/^test(\d)+$/));
            });

            it('should correctly inject services when initHandle', function(){
                delegateHandle.initHandle('a');
                expect(injectedMock).toEqual(Mock());
            });

            it('should return the object when initHandle', function(){
                expect(delegateHandle.initHandle('a')).toEqual(jasmine.any(TestObject));
            });

            it('should get the right object when getByHandle', function(){
                var a = delegateHandle.initHandle('a');
                expect(delegateHandle.getByHandle('a')).toBe(a);
                expect(delegateHandle.getByHandle('b')).not.toBe(a);
            });

            it('should get a new object when getByHandle can\' find the handle', function(){
                expect(delegateHandle.data.c).toBeUndefined();
                expect(delegateHandle.getByHandle('c')).not.toBeUndefined();
                expect(delegateHandle.data.c).not.toBeUndefined();
            });

            it('should remove the object when removeHandle', function(){
                var a = delegateHandle.initHandle('a');
                expect(delegateHandle.getByHandle('a')).toBe(a);
                delegateHandle.removeHandle('a');
                expect(delegateHandle.data.a).toBeUndefined();
            });

            it('should throw error for invalid handle name', function(){
                expect(getByHandle()).toThrow();
                expect(getByHandle(undefined)).toThrow();
                expect(getByHandle(null)).toThrow();
                expect(getByHandle('')).toThrow();
                expect(getByHandle({a : 1})).toThrow();

                expect(initHandle()).toThrow();
                expect(initHandle(undefined)).toThrow();
                expect(initHandle(null)).toThrow();
                expect(initHandle('')).toThrow();
                expect(initHandle({a : 1})).toThrow();

                expect(removeHandle()).toThrow();
                expect(removeHandle(undefined)).toThrow();
                expect(removeHandle(null)).toThrow();
                expect(removeHandle('')).toThrow();
                expect(removeHandle({a : 1})).toThrow();

                function getByHandle(val){
                    return function(){
                        return delegateHandle.getByHandle(val);
                    };
                }
                function initHandle(val){
                    return function(){
                        return delegateHandle.initHandle(val);
                    };
                }
                function removeHandle(val){
                    return function(){
                        return delegateHandle.removeHandle(val);
                    };
                }
            });
        });
    });

})();
