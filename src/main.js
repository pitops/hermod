import Vue from 'vue'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'

import VueSweetalert2 from 'vue-sweetalert2'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import { routes } from './routes'

import App from './App.vue'

Vue.config.productionTip = true

Vue.use(VueResource)
Vue.use(VueRouter)
Vue.use(ElementUI)
Vue.use(VueSweetalert2)

Vue.http.interceptors.push((request, next) => {
  request.headers.set('Content-Type', 'application/json')
  request.headers.set('Accept', 'application/json')
  next()
})

const router = new VueRouter({
  routes,
  mode: 'history'
})

new Vue({
  router: router,
  render: h => h(App)
}).$mount('#app')
