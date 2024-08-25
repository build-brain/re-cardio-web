import { createApp } from 'vue';
import router from './router/index';
import store from './state/store';
import { setupFlatpickr } from "./flatpickr";
import Multiselect from '@vueform/multiselect';
import '@vueform/multiselect/themes/default.css';

import App from './App.vue';
import { createBootstrap } from 'bootstrap-vue-next';
import VueApexCharts from "vue3-apexcharts";
import i18n from './i18n';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';
import './assets/scss/app.scss';
import 'bootstrap/dist/js/bootstrap.bundle';
import "leaflet/dist/leaflet.css";


const app = createApp(App);
setupFlatpickr(store.state.lang.locale);

store.watch(
  (state) => state.lang.locale,
  (newLocale) => {
    setupFlatpickr(newLocale);
  }
);

app
  .use(router)
  .use(i18n)
  .use(VueApexCharts)
  .use(store)
  .use(createBootstrap())
  .component('Multiselect', Multiselect)  // Передаем имя компонента и сам компонент
  .mount('#app');
