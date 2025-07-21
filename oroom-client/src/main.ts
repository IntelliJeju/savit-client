import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { OhVueIcon, addIcons } from 'oh-vue-icons'

import {
  HiSolidHome,
  HiSolidChartBar,
  HiSolidUserGroup,
  HiSolidCreditCard,
} from 'oh-vue-icons/icons'

import App from './App.vue'
import router from './router'

import ButtonItem from './components/ButtonItem.vue'

addIcons(HiSolidHome, HiSolidChartBar, HiSolidUserGroup, HiSolidCreditCard)


const app = createApp(App)

app.component('v-icon', OhVueIcon)

app.use(createPinia())
app.use(router)

app.component('ButtonItem', ButtonItem)
app.mount('#app')
