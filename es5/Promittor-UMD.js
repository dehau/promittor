(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.Promittor = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  Symbol = Symbol || function (name) {
    return name + Math.random();
  };

  var LISTENERS = Symbol('listeners');
  var PROMISE = Symbol('promise');

  var Promittor = function () {
    function Promittor() {
      var _this = this;

      var buildFn = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];

      _classCallCheck(this, Promittor);

      this[LISTENERS] = {};
      this[PROMISE] = new Promise(function (res, rej) {
        buildFn(res, rej, _this);
      });
    }

    _createClass(Promittor, [{
      key: 'then',
      value: function then(success, error) {
        var promittor = Promittor.resolve(this[PROMISE].then(success, error));
        promittor[LISTENERS] = this[LISTENERS];
        this.emit = function (event) {
          for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            data[_key - 1] = arguments[_key];
          }

          return promittor.emit.apply(promittor, [event].concat(data));
        };
        return promittor;
      }
    }, {
      key: 'catch',
      value: function _catch(error) {
        return this.then(null, error);
      }
    }, {
      key: 'on',
      value: function on(event, cb) {
        var listeners = this[LISTENERS][event] || [];
        this[LISTENERS][event] = listeners.concat([cb]);
        return this;
      }
    }, {
      key: 'off',
      value: function off(event, cb) {
        var listeners = this[LISTENERS][event] || [];
        this[LISTENERS][event] = listeners.filter(function (listener) {
          return listener !== cb;
        });
        return this;
      }
    }, {
      key: 'emit',
      value: function emit(event) {
        for (var _len2 = arguments.length, data = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          data[_key2 - 1] = arguments[_key2];
        }

        var listeners = this[LISTENERS][event] || [];
        /* [async]
         * wait for event loop's queue emptiness so
         * new Promittor((res, rej, self) => { self.emit('initial'); })
         *   .on('initial', initialHandler) will call initialHandler
         */
        setTimeout(function () {
          return listeners.forEach(function (cb) {
            return cb.apply(undefined, data);
          });
        });
        return this;
      }
    }, {
      key: 'addEventListener',
      value: function addEventListener(event, cb) {
        return this.on(event, cb);
      }
    }, {
      key: 'removeEventListener',
      value: function removeEventListener(event, cb) {
        return this.off(event, cb);
      }
    }], [{
      key: 'create',
      value: function create(buildFn) {
        return new Promittor(buildFn);
      }
    }, {
      key: 'resolve',
      value: function resolve(value) {
        return new Promittor(function (resolve) {
          return resolve(value);
        });
      }
    }, {
      key: 'reject',
      value: function reject(value) {
        return Promittor.resolve(Promise.reject(value));
      }
    }]);

    return Promittor;
  }();

  exports.default = Promittor;
  var create = exports.create = Promittor.create;
  var resolve = exports.resolve = Promittor.resolve;
  var reject = exports.reject = Promittor.reject;
});
