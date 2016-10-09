(function() {
    'use strict';

    describe('listener.service', function() {

        var module = angular.mock.module;
        var inject = angular.mock.inject;

        beforeEach(module('lh.commons.util'));

        describe('Listener.create', function(){
            var listener;
            var callback = {
                fn: function(){},
                gn: function(){},
                hn: function(){},
            };

            beforeEach(inject(function(Listener){
                listener = Listener.create();
                spyOn(callback, 'fn');
                spyOn(callback, 'gn');
                spyOn(callback, 'hn');
            }));

            it('should be able to registered by listener.on', function(){
               expect(listener.cb.length).toBe(0);
               var off = listener.on(callback.fn);
               expect(listener.cb.length).toBe(1);
               expect(listener.cb[0]).toBe(callback.fn);
               expect(off).toEqual(jasmine.any(Function));
            });

            it('should be able to deregistered by listener.off', function(){
               listener.on(callback.fn);
               expect(listener.cb.length).toBe(1);
               listener.off(callback.fn);
               expect(listener.cb.length).toBe(0);
            });

            it('should return deregister function', function(){
                spyOn(listener, 'off').and.callThrough();
                var fn = listener.on(callback.fn);
                expect(listener.cb.length).toBe(1);
                fn();
                expect(listener.cb.length).toBe(0);
                expect(listener.off).toHaveBeenCalledWith(callback.fn);
            });

            it('should notify callback function on listener.notify', inject(function($timeout){
                listener.on(callback.fn);
                expect(callback.fn).not.toHaveBeenCalled();
                listener.notify('a');
                expect(callback.fn).not.toHaveBeenCalled();
                $timeout.flush();
                expect(callback.fn).toHaveBeenCalledWith('a');
                listener.notify('b');
                $timeout.flush();
                expect(callback.fn).toHaveBeenCalledWith('b');
            }));

            it('should handle multiple callback function', inject(function($timeout){
                listener.on(callback.fn);
                listener.on(callback.gn);
                listener.on(callback.hn);
                listener.notify('a');
                $timeout.flush();
                expect(listener.cb.length).toBe(3);
                expect(callback.fn).toHaveBeenCalledWith('a');
                expect(callback.gn).toHaveBeenCalledWith('a');
                expect(callback.hn).toHaveBeenCalledWith('a');
                listener.off(callback.gn);
                expect(listener.cb.length).toBe(2);
                listener.notify('b');
                $timeout.flush();
                expect(callback.fn).toHaveBeenCalledWith('b');
                expect(callback.gn).not.toHaveBeenCalledWith('b');
                expect(callback.hn).toHaveBeenCalledWith('b');
            }));

            it('should only register once when called listener.on multiple times', inject(function($timeout){
                listener.on(callback.fn);
                listener.on(callback.fn);
                listener.on(callback.fn);
                expect(listener.cb.length).toBe(1);
                listener.notify('a');
                $timeout.flush();
                expect(callback.fn.calls.count()).toBe(1);
            }));

            it('should handle gracefully when the listener.off called multiple times with the same callback funciton', function(){
                listener.on(callback.fn);
                expect(listener.cb.length).toBe(1);
                expect(listenerOff).not.toThrow();
                expect(listenerOff).not.toThrow();
                expect(listener.cb.length).toBe(0);

                function listenerOff(){
                    listener.off(callback.fn);
                }
            });

            it('should handle gracefully when non-function is passed in', inject(function(){
                var off = listener.on('a');
                expect(listener.cb.length).toEqual(0);
                expect(off).toEqual(jasmine.any(Function));
                expect(off).not.toThrow();
                expect(notify).not.toThrow();

                expect(off).not.toThrow();

                function notify(){
                    listener.notify('a');
                }
                function off(){
                    listener.off('a');
                }
            }));
        });
    });
})();
