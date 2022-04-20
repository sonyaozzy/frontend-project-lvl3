import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import watcher from './view.js';
import ru from './locales/ru.js';
import parse from './parser.js';

export default () => {
  const state = {
    form: {
      error: '',
      processState: 'filling',
    },
    feeds: [],
    posts: [],
    uiState: {
      posts: [],
      modalPostId: '',
    },
  };

  const watchedState = watcher(state);

  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: { ru },
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

  const addListenersOnPosts = () => {
    const postContainerEl = document.querySelector('.posts ul');
    postContainerEl.addEventListener('click', (event) => {
      const postId = event.target.dataset.id;
      const postsUiState = watchedState.uiState.posts.map((post) => (post.id === postId ? { id: postId, status: 'read' } : post));

      watchedState.uiState.posts = postsUiState;
      watchedState.uiState.modalPostId = postId;
    });
  };

  const addNewPosts = (url) => {
    axios
      .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
      .then((response) => {
        const { posts } = parse(response.data.contents, url);

        posts.forEach((post) => {
          if (!watchedState.posts.some((watchedPost) => watchedPost.url === post.url)) {
            const feedId = watchedState
              .feeds
              .find((feed) => feed.url === url)
              .id;

            post.feedId = feedId;
            watchedState.posts.push(post);
            watchedState.uiState.posts.push({ id: post.id, status: 'unread' });
          }
        });
        addListenersOnPosts();
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
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
      })
      .then((response) => {
        const { feed, posts } = parse(response.data.contents, url);

        watchedState.feeds.push(feed);

        posts.forEach((post) => {
          watchedState.posts.push(post);
          watchedState.uiState.posts.push({ id: post.id, status: 'unread' });
        });

        watchedState.form.processState = 'fetched';
        watchedState.form.error = '';
        addListenersOnPosts();
      })
      .then(() => {
        const callTimeout = () => {
          addNewPosts(url);
          setTimeout(callTimeout, 5000);
        };

        setTimeout(callTimeout, 5000);
      })
      .catch((err) => {
        if (err.message === 'Network Error') {
          watchedState.form.error = i18nInstance.t('errors.networkError');
        } else {
          watchedState.form.error = err.message;
        }
        watchedState.form.processState = 'error';
      });
  });
};
