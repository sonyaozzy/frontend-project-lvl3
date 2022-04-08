import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import watchedState from './view.js';
import en from './locales/en.js';
import parse from './parser.js';

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

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    watchedState.form.processState = 'validating';
    const formData = new FormData(e.target);
    const url = formData.get('url');
    watchedState.form.currentUrl = url;

    const schema = yup
      .string()
      .url()
      .notOneOf(watchedState.feeds.map((feed) => feed.url));

    schema.validate(watchedState.form.currentUrl)
      .then(() => {
        watchedState.form.processState = 'fetching';
      })
      .then(() => {
        axios
          .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${watchedState.form.currentUrl}`)
          .then((response) => {
            const data = parse(response.data.contents);

            if (data.querySelector('rss')) {
              const feedTitleEl = data.querySelector('channel > title');
              const feedDescriptionEl = data.querySelector('channel > description');
              const feedId = _.uniqueId();
              const feed = {
                url: watchedState.form.currentUrl,
                title: feedTitleEl.textContent,
                description: feedDescriptionEl.textContent,
                id: feedId,
              };
              watchedState.feeds.push(feed);

              const postsEls = data.querySelectorAll('item');
              postsEls.forEach((postEl) => {
                const postUrlEl = postEl.querySelector('link');
                const postTitleEl = postEl.querySelector('title');
                const postDescriptionEl = postEl.querySelector('description');

                const post = {
                  url: postUrlEl.textContent,
                  title: postTitleEl.textContent,
                  description: postDescriptionEl.textContent,
                  id: _.uniqueId(),
                  feedId,
                };

                watchedState.posts.push(post);
              });
              watchedState.form.processState = 'fetched';
              watchedState.form.errors = [];
            } else {
              watchedState.form.errors = [i18nInstance.t('errors.notContainValidRss')];
              watchedState.form.processState = 'error';
            }
          })
          .catch((err) => {
            watchedState.form.errors = [err];
            watchedState.form.processState = 'error';
          });
      })
      .catch((err) => {
        watchedState.form.errors = err.errors;
        watchedState.form.processState = 'error';
      });
  });
};
