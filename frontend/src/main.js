import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Dashboard from './views/Dashboard.vue'
import EmailConfig from './views/EmailConfig.vue'
import AIConfig from './views/AIConfig.vue'
import ReplyRules from './views/ReplyRules.vue'
import RunConfig from './views/RunConfig.vue'
import Logs from './views/Logs.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: Dashboard },
    { path: '/email', component: EmailConfig },
    { path: '/ai', component: AIConfig },
    { path: '/rules', component: ReplyRules },
    { path: '/run', component: RunConfig },
    { path: '/logs', component: Logs }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
