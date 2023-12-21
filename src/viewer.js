/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
import onChange from 'on-change';
// eslint-disable-next-line import/extensions
import { initialState, elements } from './modules.js';

const createWrapper = (heading, items, i18next) => {
  const divElement = document.createElement('div');
  divElement.classList.add('card', 'border-0');

  const cardBodyElement = document.createElement('div');
  cardBodyElement.classList.add('card-body');

  const h2Element = document.createElement('h2');
  h2Element.classList.add('card-title', 'h4');
  h2Element.textContent = i18next.t(heading);

  cardBodyElement.appendChild(h2Element);
  divElement.appendChild(cardBodyElement);

  const ulElement = document.createElement('ul');
  ulElement.classList.add('list-group', 'border-0', 'rounded-0');
  items.forEach((item) => ulElement.insertAdjacentHTML('beforeend', item));

  divElement.appendChild(ulElement);
  return divElement;
};

const renderContent = (elements, state, i18next) => {
  elements.postContainer.innerHTML = '';
  elements.feedContainer.innerHTML = '';

  const posts = state.content.posts.map(({ postTitle, postLink, postId }) => {
    const linkElement = document.createElement('a');
    const buttonElement = document.createElement('button');

    const linkClass = state.ui.posts.has(postId) ? 'fw-normal' : 'fw-bold';

    linkElement.href = postLink;
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
    linkElement.dataset.id = postId;
    linkElement.dataset.link = true;
    linkElement.classList.add(linkClass);
    linkElement.textContent = postTitle;

    buttonElement.type = 'button';
    buttonElement.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    buttonElement.dataset.id = postId;
    buttonElement.dataset.bsToggle = 'modal';
    buttonElement.dataset.bsTarget = '#modal';
    buttonElement.textContent = i18next.t('view');

    const liElement = document.createElement('li');
    liElement.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    liElement.appendChild(linkElement);
    liElement.appendChild(buttonElement);

    return liElement.outerHTML;
  });

  const postWrapper = createWrapper('posts', posts, i18next);
  elements.postContainer.appendChild(postWrapper);

  const feeds = state.content.feeds.map(({ feedTitle, feedDescription }) => {
    const h3Element = document.createElement('h3');
    const pElement = document.createElement('p');

    h3Element.classList.add('h6', 'm-0');
    h3Element.textContent = feedTitle;

    pElement.classList.add('m-0', 'small');
    pElement.textContent = feedDescription;

    const liElement = document.createElement('li');
    liElement.classList.add('list-group-item', 'border-0', 'border-end-0');
    liElement.appendChild(h3Element);
    liElement.appendChild(pElement);

    return liElement.outerHTML;
  });

  const feedWrapper = createWrapper('feeds', feeds, i18next);
  elements.feedContainer.appendChild(feedWrapper);
};

const handleErrors = (elements, state, i18next) => {
  if (elements.feedback.classList.contains('text-success')) {
    elements.feedback.classList.add('text-danger');
    elements.feedback.classList.remove('text-success');
  }

  if (Object.keys(state.form.errors).length !== 0) {
    elements.feedback.textContent = i18next.t(state.form.errors.url);
    elements.urlInput.classList.add('is-invalid');
  } else {
    elements.feedback.textContent = '';
    elements.urlInput.classList.remove('is-invalid');
  }
};

const handleSuccess = (elements, i18next) => {
  if (elements.feedback.classList.contains('text-danger')) {
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
    elements.feedback.textContent = i18next.t('success');
  }
};

const changeUiAnchors = (elements, applyData) => {
  const id = applyData.args[0];
  const anchor = elements.postContainer.querySelector(`[data-link][data-id="${id}"]`);

  anchor.classList.remove('fw-bold');
  anchor.classList.add('fw-normal');
};

const handleStatus = (elements, value, i18next) => {
  switch (value) {
    case 'fetching':
      elements.urlInput.disabled = true;
      elements.submit.disabled = true;
      break;

    case 'error':
      elements.urlInput.disabled = false;
      elements.submit.disabled = false;
      break;

    case 'success':
      handleSuccess(elements, i18next);
      elements.urlInput.disabled = false;
      elements.submit.disabled = false;
      elements.form.reset();
      elements.urlInput.focus();
      break;

    default:
      throw new Error(`Unknown process ${value}`);
  }
};

const watch = (path, value, applyData, elements, state, i18next) => {
  switch (path) {
    case 'form.errors':
      handleErrors(elements, state, i18next);
      break;

    case 'form.status':
      handleStatus(elements, value, i18next);
      break;

    case 'content.posts':
      renderContent(elements, state, i18next);
      break;

    case 'ui.posts':
      changeUiAnchors(elements, applyData);
      break;

    default:
      break;
  }
};

const initState = (i18nextInstance) => {
  const state = onChange(initialState, (path, value, _previousValue, applyData) => {
    watch(path, value, applyData, elements, state, i18nextInstance);
  });

  return state;
};

export default initState;
