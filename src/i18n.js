import { createI18n } from 'vue-i18n';

async function loadLocaleMessages() {
  const locales = import.meta.glob('./lang/*.json'); 
  const messages = {};

  for (const path in locales) {
    const matched = path.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = await locales[path]().then(module => module.default);
    }
  }
  
  return messages;
}

export default createI18n({
  locale: localStorage.getItem('language') || 'ru',
  fallbackLocale: import.meta.env.VUE_APP_I18N_FALLBACK_LOCALE || 'ru',
  messages: await loadLocaleMessages(),
});
