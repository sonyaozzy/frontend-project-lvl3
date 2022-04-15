import onChange from 'on-change';
import i18next from 'i18next';
import state from './state.js';
import ru from './locales/ru.js';

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
    case 'fetching':
      elements.addButton.disabled = true;
      break;

    case 'error':
      console.log(elements.addButton);
      elements.addButton.disabled = false;
      break;

    case 'fetched':
      elements.addButton.disabled = false;
      elements.inputField.classList.remove('is-invalid');

      elements.feedbackP.classList.remove('text-danger');
      elements.feedbackP.classList.add('text-success');
      elements.feedbackP.textContent = i18nInstance.t('success');

      elements.form.reset();
      elements.inputField.focus();

      break;

    default:
      break;
  }
};

const renderErrors = (errors) => {
  console.log(errors);
  if (errors) {
    errors.forEach((errorMessage) => {
      elements.inputField.classList.add('is-invalid');
      elements.feedbackP.classList.remove('text-success');
      elements.feedbackP.classList.add('text-danger');
      elements.feedbackP.textContent = errorMessage;
    });
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
    liEl.innerHTML = `
    <h3 class="h6 m-0">${feed.title}</h3>
    <p class="m-0 small text-black-50">${feed.description}</p>
    `;
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
    liEl.innerHTML = `
    <a href="${post.url}" data-id="${post.id}" target="_blank" rel="noopener noreferrer">${post.title}</a>
    <button type="button" class="btn btn-outline-primary btn-sm" data-id="${post.id}" data-bs-toggle="modal" data-bs-target="#modal">${i18nInstance.t('view')}</button>
    `;

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

const renderModal = (postId, watchedState) => {
  const activePost = watchedState.posts.find((post) => post.id === postId);

  const titleEl = document.querySelector('.modal-title');
  titleEl.textContent = activePost.title;

  const descriptionEl = document.querySelector('.modal-body');
  descriptionEl.textContent = activePost.description;

  const readMoreButton = document.querySelector('.full-article');
  readMoreButton.setAttribute('href', activePost.url);
};

const watchedState = onChange(state, (path, value) => {
  switch (path) {
    case 'form.processState':
      handleProcessState(value);
      break;

    case 'form.errors':
      renderErrors(value);
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
      renderModal(value, watchedState);
      break;

    default:
      throw new Error(`Unknown path: ${path}`);
  }
});

export default watchedState;
