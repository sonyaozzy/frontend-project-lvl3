export default (contents, url) => {
  const domparser = new DOMParser();
  const data = domparser.parseFromString(contents, 'application/xml');

  if (!data.querySelector('rss')) {
    throw new Error('NotValidRss');
  }

  const feedTitle = data.querySelector('channel > title').textContent;
  const feedDescription = data.querySelector('channel > description').textContent;

  const feed = {
    url,
    title: feedTitle,
    description: feedDescription,
  };

  const posts = [];
  const postsEls = data.querySelectorAll('item');

  postsEls.forEach((postEl) => {
    const postUrl = postEl.querySelector('link').textContent;
    const postTitle = postEl.querySelector('title').textContent;
    const postDescription = postEl.querySelector('description').textContent;

    const post = {
      url: postUrl,
      title: postTitle,
      description: postDescription,
    };

    posts.push(post);
  });

  return { feed, posts };
};
