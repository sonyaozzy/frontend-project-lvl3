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

  const makeRequest = (url) => {
    axios
      .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then((response) => {
        const data = parse(response.data.contents);

        if (data.querySelector('rss')) {
          const feedTitle = data.querySelector('channel > title').textContent;
          const feedDescription = data.querySelector('channel > description').textContent;
          const feedId = _.uniqueId();

          const feed = {
            url,
            title: feedTitle,
            description: feedDescription,
            id: feedId,
          };

          watchedState.feeds.push(feed);

          const postsEls = data.querySelectorAll('item');

          postsEls.forEach((postEl) => {
            const postUrl = postEl.querySelector('link').textContent;
            const postTitle = postEl.querySelector('title').textContent;
            const postDescription = postEl.querySelector('description').textContent;

            const post = {
              url: postUrl,
              title: postTitle,
              description: postDescription,
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
  };

  const addNewPosts = (url) => {
    axios
      .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then((response) => {
        const data = parse(response.data.contents);

        const postsEls = data.querySelectorAll('item');

        postsEls.forEach((postEl) => {
          const postUrl = postEl.querySelector('link').textContent;

          if (!watchedState.posts.some((post) => post.url === postUrl)) {
            const postDescription = postEl.querySelector('description').textContent;
            const postTitle = postEl.querySelector('title').textContent;

            const feedId = watchedState
              .feeds
              .find((feed) => feed.url === url)
              .id;

            const post = {
              url: postUrl,
              title: postTitle,
              description: postDescription,
              id: _.uniqueId(),
              feedId,
            };

            watchedState.posts.push(post);
          }
        });
      });
  };

  const formEl = document.querySelector('form');

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    watchedState.form.processState = 'validating';
    const formData = new FormData(e.target);
    const url = formData.get('url');

    const schema = yup
      .string()
      .url()
      .notOneOf(watchedState.feeds.map((feed) => feed.url));

    schema.validate(url)
      .then(() => {
        watchedState.form.processState = 'fetching';
      })
      .then(() => {
        makeRequest(url);

        const callTimeout = () => {
          addNewPosts(url);
          setTimeout(callTimeout, 5000);
        };

        setTimeout(callTimeout, 5000);
      })
      .catch((err) => {
        watchedState.form.errors = err.errors;
        watchedState.form.processState = 'error';
      });
  });
};
