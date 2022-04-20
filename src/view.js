import onChange from 'on-change';
import i18next from 'i18next';
import ru from './locales/ru.js';

const render = (state) => (path, value) => {
  const i18nInstance = i18next.createInstance();

  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources: { ru },
  });

  const elements = {
    form: document.querySelector('form'),
    inputField: document.getElementById('url-input'),
    addButton: document.querySelector('button[aria-label=add]'),
    feedbackP: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const handleProcessState = (processState) => {
    switch (processState) {
      case 'validating':
        elements.addButton.disabled = true;
        break;

      case 'fetching':
        elements.addButton.disabled = true;
        break;

      case 'error':
        elements.addButton.disabled = false;
        break;

      case 'fetched':
        elements.addButton.disabled = false;
        elements.inputField.classList.remove('is-invalid');

        elements.feedbackP.classList.remove('text-danger');
        elements.feedbackP.classList.add('text-success');
        elements.feedbackP.textContent = i18nInstance.t('success');

        elements.inputField.value = '';
        elements.inputField.focus();

        break;

      default:
        break;
    }
  };

  const renderError = (error) => {
    if (error !== '') {
      elements.inputField.classList.add('is-invalid');
      elements.feedbackP.classList.remove('text-success');
      elements.feedbackP.classList.add('text-danger');
      elements.feedbackP.textContent = error;
    }
  };

  const renderFeeds = (feeds) => {
    elements.feeds.innerHTML = '';

    const divEl = document.createElement('div');
    divEl.classList.add('card', 'border-0');
    elements.feeds.append(divEl);

    const divTitleEl = document.createElement('div');
    divTitleEl.classList.add('card-body');
    divEl.append(divTitleEl);

    const h2El = document.createElement('h2');
    h2El.classList.add('card-title', 'h4');
    h2El.textContent = i18nInstance.t('feeds');
    divTitleEl.append(h2El);

    const ulEl = document.createElement('ul');
    ulEl.classList.add('list-group', 'border-0', 'rounded-0');

    feeds.forEach((feed) => {
      const liEl = document.createElement('li');
      liEl.classList.add('list-group-item', 'border-0', 'border-end-0');

      const h3El = document.createElement('h3');
      h3El.classList.add('h6', 'm-0');
      h3El.textContent = feed.title;
      liEl.append(h3El);

      const pEl = document.createElement('p');
      pEl.classList.add('m-0', 'small', 'text-black-50');
      pEl.textContent = feed.description;
      liEl.append(pEl);

      ulEl.prepend(liEl);
    });

    divEl.append(ulEl);
  };

  const renderPosts = (posts) => {
    elements.posts.innerHTML = '';

    const divEl = document.createElement('div');
    divEl.classList.add('card', 'border-0');
    elements.posts.append(divEl);

    const divTitleEl = document.createElement('div');
    divTitleEl.classList.add('card-body');
    divEl.append(divTitleEl);

    const h2El = document.createElement('h2');
    h2El.classList.add('card-title', 'h4');
    h2El.textContent = i18nInstance.t('posts');
    divTitleEl.append(h2El);

    const ulEl = document.createElement('ul');
    ulEl.classList.add('list-group', 'border-0', 'rounded-0');

    posts.forEach((post) => {
      const liEl = document.createElement('li');
      liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

      const aEl = document.createElement('a');
      aEl.setAttribute('href', post.url);
      aEl.dataset.id = post.id;
      aEl.setAttribute('target', '_blank');
      aEl.setAttribute('rel', 'noopener noreferrer');
      aEl.textContent = post.title;
      liEl.append(aEl);

      const buttonEl = document.createElement('button');
      buttonEl.setAttribute('type', 'button');
      buttonEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      buttonEl.dataset.id = post.id;
      buttonEl.dataset.bsToggle = 'modal';
      buttonEl.dataset.bsTarget = '#modal';
      buttonEl.textContent = i18nInstance.t('view');
      liEl.append(buttonEl);

      ulEl.prepend(liEl);
    });

    divEl.append(ulEl);
  };

  const renderPostsUiState = (postsUiState) => {
    postsUiState.forEach((post) => {
      const postEl = document.querySelector(`a[data-id="${post.id}"]`);
      switch (post.status) {
        case 'unread':
          postEl.classList.add('fw-bold');
          break;

        case 'read':
          postEl.classList.remove('fw-bold');
          postEl.classList.add('fw-normal');
          break;

        default:
          throw new Error(`Unknown status: ${post.status}`);
      }
    });
  };

  const renderModal = (postId) => {
    const activePost = state.posts.find((post) => post.id === postId);

    const titleEl = document.querySelector('.modal-title');
    titleEl.textContent = activePost.title;

    const descriptionEl = document.querySelector('.modal-body');
    descriptionEl.textContent = activePost.description;

    const readMoreButton = document.querySelector('.full-article');
    readMoreButton.setAttribute('href', activePost.url);
  };

  switch (path) {
    case 'form.processState':
      handleProcessState(value);
      break;

    case 'form.error':
      renderError(value);
      break;

    case 'feeds':
      renderFeeds(value);
      break;

    case 'posts':
      renderPosts(value);
      break;

    case 'uiState.posts':
      renderPostsUiState(value);
      break;

    case 'uiState.modalPostId':
      renderModal(value);
      break;

    default:
      throw new Error(`Unknown path: ${path}`);
  }
};

const watcher = (state) => onChange(state, render(state));

export default watcher;
