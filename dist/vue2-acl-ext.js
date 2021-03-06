"use strict";

/**
 * Vue2 ACL with user roles maintained in a Vuex store.
 * This code is inspired by 
 * vue-acl by leonardo vilarinho'
 * on github 
 * https://github.com/leonardovilarinho/vue-acl
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_PERMS = 'PUB';
var DEFAULT_FAIL = '/login';

var Acl = function () {
  function Acl() {
    _classCallCheck(this, Acl);
  }

  _createClass(Acl, [{
    key: 'init',
    value: function init(router, store, fail) {
      this.router = router;
      this.store = store;

      this.fail = fail || DEFAULT_FAIL;
      try {
        var msg = '';
        if (!('user' in this.store.state)) {
          msg += '\n\tMissing key \'user\' in\n\tstore.state';
        }
        if (!('roles' in this.store.state.user)) {
          msg += '\n\tMissing key \'roles\' in\n\tstore.state.user';
        }
        if (msg.length > 0) {
          throw new Error(msg);
        }
      } catch (ex) {
        console.error('Exception in vue2-acl-ext init', ex.message);
        console.error('\n\t********* FATAL ERROR *********\n' + '\n\tFatal error in\n\tvue2-acl-ext ACL plugin' + ex.message + '\n\n\t********* FATAL ERROR *********\n\n');
      }
    }
  }, {
    key: 'currentPerms',
    value: function currentPerms() {
      var r = this.store.state.user.roles; // this.store.getters['GET_USER'].roles
      return r.length < 2 ? DEFAULT_PERMS : r.trim();
    }
  }, {
    key: 'check',
    value: function check(permission) {
      if (permission == undefined) return false;
      var permissions = permission.indexOf('|') !== -1 ? permission.split('|') : [permission];
      return this.findPermission(permissions) !== undefined;
    }
  }, {
    key: 'findPermission',
    value: function findPermission(pem) {
      var userPerms = this.currentPerms();
      return pem.find(function (permission) {
        var needed = permission.indexOf('&') !== -1 ? permission.split('&') : permission;
        if (Array.isArray(needed)) {
          return needed.every(function (need) {
            return userPerms.indexOf(need) !== -1;
          });
        }
        return userPerms.indexOf(needed) !== -1;
      });
    }
  }, {
    key: 'clearPermissions',
    value: function clearPermissions(permissions) {
      if (permissions.indexOf('&') !== -1) permissions = permissions.split('&');
      return Array.isArray(permissions) ? permissions : [permissions];
    }
  }, {
    key: 'router',
    set: function set(router) {
      var _this = this;
      router.beforeEach(function (to, from, next) {
        var fail = to.meta.fail || _this.fail;
        try {
          var perm = to.meta.permission || DEFAULT_PERMS;
          if (perm == DEFAULT_PERMS) return next();

          if (!_this.check(perm)) return next(fail);

          return next();
        } catch (ex) {
          return next(fail);
        }
      });
    }
  }]);

  return Acl;
}();

var acl = new Acl();

acl.install = function (Vue, _ref) {
  var router = _ref.router,
      store = _ref.store,
      fail = _ref.fail;

  acl.init(router, store, fail);
  Vue.prototype.$can = function (permission) {
    return acl.check(permission);
  };
};

exports.default = acl;
