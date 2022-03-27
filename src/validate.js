import * as yup from 'yup';
import watchedState from './view.js';

export default () => {
  const formEl = document.querySelector('form');

  const validateUrl = () => {
    const schema = yup
      .string()
      .url('Link must be a valid URL')
      .notOneOf(watchedState.feedList, 'RSS already exists');

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
