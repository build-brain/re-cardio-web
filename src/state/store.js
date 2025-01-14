import { createStore } from 'vuex'

import modules from './modules'

const store = createStore({
  modules:modules,
  strict: process.env.NODE_ENV !== 'production'
})

export default store

