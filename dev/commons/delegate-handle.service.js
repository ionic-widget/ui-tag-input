(function() {
    'use strict';

    /**
     * Utility to create delegate-handle
     * Used to provide a handle for the controller to access or modify data in a directive
     *
     * In html:
     * <custom-directive delegate-handle="handle_name"></custom-directive>
     *
     * In controller:
     * CustomDirectiveDataService.getByHandle('handle_name').doSomething();
     *
     * In directive:
     * CustomDirectiveDataService.initHandle('handle_name');
     * CustomDirectiveDataService.getByHandle('handle_name').doSomething();
     *
     * In service:
     * service('CustomDirectiveDataService', CustomDirectiveDataService)
     * function CustomDirectiveDataService(DelegateHandle) {
     *
     *    //prefix is used in a directives that did have `delegate-handle` attr, it generate a id with that prefix
     *    return DelegateHandle(CustomDirectiveData, 'prefix');
     * }
     * CustomDirectiveData.$inject = [...]
     * function CustomDirectiveData(...){ ... };
     *
     */

    angular
        .module('lh.commons.util')
        .factory('DelegateHandle', DelegateHandle);

    DelegateHandle.$inject = ['$injector'];

    function DelegateHandle($injector) {
        return {
            create: create
        };
        function create(clz, prefix) {
            return new DelegateHandleMap(clz, prefix);
        }
        function DelegateHandleMap(clz, prefix){
            /*jshint validthis:true */
            this._prefix = prefix;
            this._clz = clz;
            this.data = {};
            this._index = 0;

            this.initHandle = initHandle;
            this.getByHandle = getByHandle;
            this.generateHandle = generateHandle;
            this.removeHandle = removeHandle;

            //////////////////////

            function initHandle(handle) {
                if (!angular.isString(handle) || handle === '') {
                    throw new Error('handle is not a sring');
                }
                this.data[handle] = $injector.instantiate(this._clz);
                return this.data[handle];
            }

            function getByHandle(handle) {
                if (!angular.isString(handle) || handle === '') {
                    throw new Error('handle is not a sring');
                }
                if(angular.isUndefined(this.data[handle])){
                    return this.initHandle.call(this, handle);
                }
                return this.data[handle];
            }

            function generateHandle(){
                return this._prefix + (this._index ++ % 1000000);
            }

            function removeHandle(handle) {
                if (!angular.isString(handle) || handle === '') {
                    throw new Error('handle is not a sring');
                }
                delete this.data[handle];
            }
        }
    }

})();
