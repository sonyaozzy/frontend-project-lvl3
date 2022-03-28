import * as yup from 'yup';
import i18next from 'i18next';
import watchedState from './view.js';
import en from './locales/en.js';

export default () => {
  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: 'en',
    debug: false,
    resources: { en },
  }).then(() => {
    yup.setLocale({
      mixed: {
        notOneOf: i18nInstance.t('errors.dublicateUrl'),
      },
      string: {
        url: i18nInstance.t('errors.invalidUrl'),
      },
    });
  });

  const formEl = document.querySelector('form');

  const validateUrl = () => {
    const schema = yup
      .string()
      .url()
      .notOneOf(watchedState.feedList);

    return schema.validate(watchedState.urlInput)
      .then((url) => {
        watchedState.feedList.push(url);
        watchedState.valid = true;
        watchedState.errors = [];
      })
      .catch((e) => {
        watchedState.valid = false;
        watchedState.errors = e.errors;
      });
  };

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url');
    watchedState.urlInput = url;

    validateUrl();
  });
};
