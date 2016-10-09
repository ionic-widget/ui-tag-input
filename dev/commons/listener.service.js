(function() {
    'use strict';

    /**
     *
     * Observer Pattern
     *
     * Listener.create -> return a new listener object
     *
     * listener object
     * listener.on -> register callback, return deregister callback function
     * listener.off -> deregister callback
     * listener.notify -> fire events, call all callbacks registered
     *
     */

    angular
        .module('lh.commons.util')
        .factory('Listener', ListenerService);

    ListenerService.$inject = ['$timeout'];

    function ListenerService($timeout) {
        return {
            create: create
        };
        function create() {
            return new Listener();
        }
        function Listener(){
            var listener = this;
            listener.cb = [];

            listener.on = on;
            listener.off = off;
            listener.notify = notify;

            //////////////////////
            function on(cb){
                if (!angular.isFunction(cb)) {
                    return angular.noop;
                }
                if(listener.cb.indexOf(cb) === -1){
                    listener.cb.push(cb);
                }
                return listener.off.bind(listener, cb);
            }

            function off(cb){
                var index = listener.cb.indexOf(cb);
                if(index > -1){
                    listener.cb.splice(index, 1);
                }
            }

            function notify(){
                var args = arguments;

                listener.cb.forEach(function(cb){
                    $timeout(function(){
                        cb.apply(null, args);
                    });
                });
            }

        }

    }

})();
