// store/state/lang.js

export const state = {
  locale: localStorage.getItem('language') || 'ru',
};

export const mutations = {
  setLocale(state, locale) {
    state.locale = locale;
    localStorage.setItem('language', locale);
  },
};

export const actions = {
  setLocale({ commit }, locale) {
    commit('setLocale', locale);
  },
};

export const getters = {
  currentLocale: (state) => state.locale,
};
