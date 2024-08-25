import { createI18n } from "vue-i18n";
import store from './state/store'; // импортируйте ваш Vuex store

import ru from "./lang/ru.json";
import uz from "./lang/uz.json";

const i18n = createI18n({
  locale: store.state.lang.locale,
  fallbackLocale: "ru",
  messages: { ru, uz },
  legacy: true,
});

store.watch(
  (state) => state.lang.locale,
  (newLocale) => {
    store.dispatch('lang/setLocale', newLocale);
  
    i18n.global.locale = newLocale;
    console.log(i18n.global.locale);
  }
);

export default i18n;
