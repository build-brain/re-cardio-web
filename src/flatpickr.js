
import flatpickr from "flatpickr";
import { Russian } from "flatpickr/dist/l10n/ru.js";
import { Uzbek } from "flatpickr/dist/l10n/uz.js";

const locales = {
  ru: Russian,
  uz: Uzbek
};

export const setupFlatpickr = (locale) => {
  flatpickr.localize(locales[locale] || Russian);

  // Перезапустить все инстансы flatpickr
  const datepickers = document.querySelectorAll('.flatpickr-input');
  datepickers.forEach(el => {
    if (el._flatpickr) {
      el._flatpickr.destroy();
    }
    flatpickr(el);
  });
};
