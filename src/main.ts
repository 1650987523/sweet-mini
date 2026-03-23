// uview-plus 全局引入
import uviewPlus from 'uview-plus'
import { createSSRApp } from 'vue'
import App from './App.vue'
import { requestInterceptor } from './http/interceptor'

import { routeInterceptor } from './router/interceptor'
import store from './store'
import '@/style/index.scss'

import 'virtual:uno.css'
import 'uview-plus/index.scss'

export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  app.use(routeInterceptor)
  app.use(requestInterceptor)
  app.use(uviewPlus)

  return {
    app,
  }
}
