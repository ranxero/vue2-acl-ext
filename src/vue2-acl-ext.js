"use strict"

const SESSION_STORE_KEY = 'vue2-acl-ext'
const DEFAULT_PERMS = 'PUB'
const DEFAULT_FAIL = '/login'

class Acl {

    init(router, store, fail) {
				this.router = router
				this.store = store
	
				this.fail = fail || DEFAULT_FAIL
				try {
					let msg = ''
					if (! ('user' in this.store.state)) {
						msg += '\n\tMissing key \'user\' in\n\tstore.state'
					}
					if (! ('roles' in this.store.state.user)) {
						msg += '\n\tMissing key \'roles\' in\n\tstore.state.user'
					}
					if (msg.length>0) {
						throw new Error(msg)
					}
				} catch (ex) {
					console.error('Exception in vue2-acl-ext init', ex.message)
					console.error(
						'\n\t********* FATAL ERROR *********\n'+
						'\n\tFatal error in\n\tvue2-acl-ext ACL plugin'+ 
						ex.message + 
						'\n\n\t********* FATAL ERROR *********\n\n'
					)
				}
    }

		currentPerms() {
			const r = this.store.state.user.roles // this.store.getters['GET_USER'].roles
			return r.length < 2 ? DEFAULT_PERMS : r.trim()
		}

		check(permission) {
			if (permission == undefined) 
				return false
			const permissions = 
				permission.indexOf('|') !== -1 ? permission.split('|') : [permission]
			return this.findPermission(permissions) !== undefined
		}
		
    findPermission(pem) {
			const userPerms = this.currentPerms()
			return pem.find((permission) => {
				const needed = permission.indexOf('&') !== -1 ? permission.split('&') : permission
				if (Array.isArray(needed)) { 
					return needed.every((need) => {
						return userPerms.indexOf(need) !== -1
					})
				}
				return userPerms.indexOf(needed) !== -1
			})    
		}

    clearPermissions(permissions) {
			if (permissions.indexOf('&') !== -1) 
				permissions = permissions.split('&')
			return Array.isArray(permissions) ? permissions : [permissions]
		}

    set router(router) {
			var _this = this
			router.beforeEach(function (to, from, next) {
				const fail = to.meta.fail || _this.fail
				try {
								const perm = to.meta.permission || DEFAULT_PERMS
								if (perm == DEFAULT_PERMS) 
									return next()

								if (!_this.check(perm)) 
									return next(fail)

								return next()
				} catch (ex) {
					return next(fail)
				}
			})
		}
}

let acl = new Acl()

acl.install = (Vue, {router, store, fail}) => {
    acl.init(router, store, fail)
    Vue.prototype.$can = (permission) => acl.check(permission)
}

export default acl
