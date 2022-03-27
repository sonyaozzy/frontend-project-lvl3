import onChange from 'on-change';
import state from './state.js';

const watchedState = onChange(state, (path, value) => {
  const inputField = document.getElementById('url-input');
  const formEl = document.querySelector('form');
  const feedbackPEl = document.querySelector('.feedback');

  inputField.classList.remove('is-invalid');
  feedbackPEl.textContent = '';

  if (path === 'errors') {
    if (value.length !== 0) {
      watchedState.errors.forEach((errorMessage) => {
        inputField.classList.add('is-invalid');

        feedbackPEl.textContent = errorMessage;
      });
    } else {
      formEl.reset();
      inputField.focus();
    }
  }
});

export default watchedState;
