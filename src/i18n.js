import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';
import ru from './lang/ru.json';
import uz from './lang/uz.json';

const i18n = createI18n({
    legacy: false,
    locale: 'ru',
    fallbackLocale: 'uz',
    messages: {
        ru,
        uz,
    },
});

export function setI18nLanguage(i18n, locale) {
    if (i18n.mode === 'legacy') {
        i18n.global.locale = locale;
    } else {
        i18n.global.locale.value = locale;
    }
    document.querySelector('html').setAttribute('lang', locale);
}

export async function loadLocaleMessages(i18n, locale) {
    const messages = await import(
        /* webpackChunkName: "locale-[request]" */ `./lang/${locale}.json`
    );
    i18n.global.setLocaleMessage(locale, messages.default);
    return nextTick();
}

export default i18n;
