# Modified Access Control List Plugin
### Inspired by:
# Plugin of Access Control List from Vue JS 2 - vue-acl

https://github.com/leonardovilarinho/vue-acl

Documentation only contains relevant aspects of the modification
The modification switches the role model to a 
Vuex store.state.user.roles 
model

### Dependencies:
- Vue.js version 2
- vue-router
- vuex

### Installation

We have two methods of installed, you can use the npm or a standalone.

#### To install with NPM

Use the following command to install as dependency:
```bash
npm install vue2-acl-ext --save
```
### Get Started:

**[1]:** Import the plugin and register it on VueJS, it is necessary to send as a parameter the vue router-router and the Vuex store with as user.roles string inside the state:

```js
import Router from '../routes/router'
import Store from '../store/store'
import Acl from 'vue2-acl-ext'
Vue.use( Acl, { router: Router, store: Store, fail: '/error' } )
```
>> the former parameter 'save' has been removed as the user's roles 
>> are maintained in the Vuex store
>> the `fail` parameter is optional. default is `/login`

**[2]:** Add metadata in their routes saying which permission, or group of permissions is required to access the route, use pipe (|) to do an OR check for more than one permission, use (&) to do an AND check for multiple permissions (these can be used in combination for more complex situations). Use the ' fail ' metadata to indicate which this route to redirect on error:
```js
[
  {
    path: '/',
    component: require('./components/Public.vue')
		// no permissions needed -> public
  },
  {
    path: '/manager',
    component: require('./components/Manager.vue'),
    meta: {
      permission: 'manager' // single permission
    }
  },
  {
    path: '/client',
    component: require('./components/Client.vue'),
    meta: {
      permission: 'client|editor', // multiple OR 
			fail: '/client_error'
    }
  },
  {
    path: '/topsecret',
    component: require('./components/TopSecret.vue'),
    meta: {
      permission: 'admin&su' // mutiple AND
    }
  },
]
```

*Note1:* when meta.permission is not set there will be no ACL

*Note2:* Use `fail` to declare redirect error excluvise to this route.

**[3]:** The components use the global method `$can()` to verify that the system gives access to permission passed by parameter:

```vue
<router-link v-show='$can("client|manager")'  to='/client'>To client</router-link> |
<router-link v-show='$can("admin&su")'  to='/topSecret'>To client</router-link> |
<router-link v-show='$can("manager")'         to='/manager'>To manager</router-link> |
<router-link v-show='$can("public")'          to='/'>To Public</router-link>
```

This method receives a parameter with the permissions to check, separated by a pipe (|) or ampersand (&), and returns a `bool` saying if permission has been granted.

NOTE:
the current system's permission cannt be changed via the global 
attribute `access`. 
setting new system permissions must happen via update on 
store.state.user.roles inside the Vues store

