import { createApp } from 'vue';
import router from './router/index';
import store from './state/store';

import App from './App.vue';
import { createBootstrap } from 'bootstrap-vue-next';
import VueApexCharts from "vue3-apexcharts";
import i18n from './i18n';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import './assets/scss/app.scss';
import 'bootstrap/dist/js/bootstrap.bundle';


const app = createApp(App);

app
  .use(router)
  .use(i18n)
  .use(VueApexCharts)
  .use(store)
  .use(createBootstrap())
  .mount('#app');
  