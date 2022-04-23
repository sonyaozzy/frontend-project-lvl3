import _ from 'lodash';
import i18next from 'i18next';
import ru from './locales/ru.js';

export default (contents, url) => {
  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: { ru },
  });

  const domparser = new DOMParser();
  const data = domparser.parseFromString(contents, 'application/xml');

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

    const posts = [];
    const postsEls = data.querySelectorAll('item');

    postsEls.forEach((postEl) => {
      const postUrl = postEl.querySelector('link').textContent;
      const postTitle = postEl.querySelector('title').textContent;
      const postDescription = postEl.querySelector('description').textContent;
      const postId = _.uniqueId();

      const post = {
        url: postUrl,
        title: postTitle,
        description: postDescription,
        id: postId,
        feedId,
      };

      posts.push(post);
    });

    return { feed, posts };
  }
  throw new Error(i18nInstance.t('errors.notContainValidRss'));
};
