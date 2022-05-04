import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import watcher from './view.js';
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

  yup.setLocale({
    mixed: {
      notOneOf: 'dublicateUrl',
    },
    string: {
      url: 'invalidUrl',
    },
  });

  const watchedState = watcher(state);

  const addListenersOnPosts = () => {
    const postContainerEl = document.querySelector('.posts');
    postContainerEl.addEventListener('click', (event) => {
      const postId = event.target.dataset.id;
      const postsUiState = watchedState.uiState.posts.map((post) => (post.id === postId ? { id: postId, status: 'read' } : post));
      watchedState.uiState.posts = postsUiState;
      if (event.target.dataset.bsToggle === 'modal') {
        watchedState.uiState.modalPostId = postId;
      }
    });
  };

  addListenersOnPosts();

  const addPostInState = (post, feedId) => {
    const postId = _.uniqueId();

    watchedState.posts.push({ ...post, id: postId, feedId });
    watchedState.uiState.posts.push({ id: postId, status: 'unread' });
  };

  const addNewPosts = (url) => axios
    .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      const { posts } = parse(response.data.contents, url);

      const feedId = watchedState
        .feeds
        .find((feed) => feed.url === url)
        .id;

      posts.forEach((post) => {
        if (!watchedState.posts.some((watchedPost) => watchedPost.url === post.url)) {
          addPostInState(post, feedId);
        }
      });
    });

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

        const feedId = _.uniqueId();
        watchedState.feeds.push({ ...feed, id: feedId });

        posts.forEach((post) => {
          addPostInState(post, feedId);
        });

        watchedState.form.processState = 'fetched';
        watchedState.form.error = '';

        const callTimeout = () => addNewPosts(url)
          .finally(() => setTimeout(callTimeout, 5000));

        setTimeout(callTimeout, 5000);
      })
      .catch((err) => {
        if (err.message === 'Network Error') {
          watchedState.form.error = 'networkError';
        } else if (err.message === 'NotValidRss') {
          watchedState.form.error = 'notContainValidRss';
        } else {
          watchedState.form.error = err.message;
        }

        watchedState.form.processState = 'error';
      });
  });
};
