import onChange from 'on-change';

import i18n from 'i18next';
import ru from './locales/ru.js';
import 'bootstrap';

const elements = {
  form: document.querySelector('.rss-form'),
  feedBackMessageParagraph: document.querySelector('.feedback'),
  urlInput: document.getElementById('url-input'),
  postsContainer: document.querySelector('.posts'),
  feedsContainer: document.querySelector('feeds'),
  submitBtn: document.querySelector('button[type="submit"]'),  
};

const launchViewer = (initialState) => {
  const i18nInstanse = i18n.createInstance();
  
  i18nInstanse.init({
    lng: ru,
    debug: true,
    resources: {
      ru,  
    },
  });
  
  document.querySelector('h1').textContent = i18nInstanse.t('header1');
  document.querySelector('.lead').textContent = i18nInstanse.t('header2');
  document.querySelector('button[type="submit"]').textContent = i18nInstanse.t('btnSubmit');
  document.querySelector('.textMuted').textContent = i18nInstanse.t('urlExample');
  document.querySelector('label[for="url-input"]').textContent = i18nInstanse.t('inputLabel');

  const wathedState = onChange(initialState, (path, value) => {
    if (path === 'procces') {
      if (value === 'validationFail') {
        elements.urlInput.classList.add('is-invalid');
        elements.feedBackMessageParagraph.textContent = '';
        elements.feedBackMessageParagraph.classList.remove('text-success');
        elements.feedBackMessageParagraph.classList.add('text-danger');

        const { error } = wathedState.validationProcess;
        elements.feedBackMessageParagraph.textContent = i18nInstanse.t(error);
      } else if (value === 'rssLoader' || value === 'rssUpdater') {
        elements.feedBackMessageParagraph.textContent = '';
        elements.urlInput.classList.remove('is-invalid');
        elements.feedBackMessageParagraph.classList.remove('text-danger');
        elements.feedBackMessageParagraph.classList.add('text-success');
        elements.feedBackMessageParagraph.textContent = i18nInstanse.t('successMessage');
        elements.urlInput.value = '';

        elements.form.focus();

        elements.postsContainer.innerHTML = '';
        elements.feedsContainer.innerHTML = '';

        const feedsInnerContainer = document.createElement('div');
        feedsInnerContainer.id = 'currentFeed';
        const postsInnerContainer = document.createElement('div');
        postsInnerContainer.id = 'cureentPosts';

        const headerFeed = document.createElement('h3');
        const titleFeed = document.createElement('h3');
        titleFeed.classList.add('h6', 'm-0');
        const descriptionFeed = document.createElement('p');
        descriptionFeed.classList.add('m-0', 'small', 'black-text-50');

        const headerPost = document.createElement('h3');
        const ulFeeds = document.createElement('ul');
        ulFeeds.classList.add('list-group', 'border-0');
        ulFeeds.id = 'ulFeeds';

        const ulPosts = document.createElement('ul');
        ulPosts.classList.add('list-group', 'border-0');
        ulPosts.id = 'ulPosts';

        postsInnerContainer.append(ulPosts);
        feedsInnerContainer.append(ulFeeds);

        headerPost.textContent = 'Posts';
        headerFeed.textContent = 'Feeds';

        const { feeds, posts } = wathedState;
        const currFeed = feeds[feeds.length - 1];
        const { title, id, description } = currFeed;

        titleFeed.textContent = title;
        descriptionFeed.textContent = description;
        feedsInnerContainer.append(ulFeeds);

        elements.feedsContainer.append(headerFeed, feedsInnerContainer);
        elements.postsContainer.append(headerPost, postsInnerContainer);

        const currPosts = posts.filter((post) => post.fId === id);

        const postEls = currPosts.map((post) => {
          const li = document.createElement('li');
          li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

          const a = document.createElement('a');
          a.href = post.link;
          a.textContent = post.title;
          a.dataset.id = post.id;

          const styleToApply = (wathedState.shown.includes(post.id)) ? 'fw-normal' : 'fw-bold';
          a.classList.add(styleToApply);
          a.setAttribute('data-id', post.id);

          li.append(a);

          const btn = document.createElement('button');
          btn.classList.add('btn', 'btn-outline-primary');
          btn.setAttribute('type', 'button');
          btn.setAttribute('data-id', post.id);
          btn.setAttribute('data-bs-toggle', 'modal');
          btn.setAttribute('data-bs-target', '#modal');
          btn.textContent = i18nInstanse.t('see');
          li.appendChild(btn);
          return li;
        });

        ulPosts.append(...postEls);
        postsInnerContainer.replaceChildren(ulPosts);

        const feedEls = feeds.map((feed) => {
          const li = document.createElement('li');
          li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
          const h = document.createElement('h3');
          h.textContent = feed.title;
          const p = document.createElement('p');
          p.textContent = feed.description;
          li.append(h, p);
          return li;
        });

        ulFeeds.prepend(...feedEls);
        feedsInnerContainer.replaceChildren(ulFeeds);
      }; 
    } else if (path.startsWith('postValidationErrors')){
      const currentError = value[value.length - 1];
      console.log('current value', value);
      const textError = i18nInstanse.t(currentError);
      elements.feedBackMessageParagraph.classList.remove('text-success');
      elements.feedBackMessageParagraph.classList.add('text-danger');
      elements.feedBackMessageParagraph.textContent = textError;
    } else if (path.startsWith('shown')) {
      const { shown } = wathedState;
      shown.forEach((id) => {
        const elToSetStyle = document.querySelector(`a[data-id="${id}"]`);
        console.log(elToSetStyle, 'element to change style');
        elToSetStyle.classList.remove('fw-bold');
        elToSetStyle.classList.add('fw-normal');
      });
    } else if (path === 'uiState.submitBlocked') {
      if (value === true) {
        elements.submitBtn.disabled = true;
      } else {
        elements.submitBtn.disabled = false;
      };
    } else if (path === 'activePost') {
      const { posts } = wathedState;
      const postData = posts.find((item) => item.id === value);
      const modalTitle = document.querySelector('.modal-title');
      modalTitle.textContent = postData.title;
      const modalBody = document.querySelector('.modal-body');
      modalBody.textContent = postData.description;
      const modalHref = document.querySelector('.full-article');
      modalHref.href = postData.link;
    };
  }); 
  return wathedState;
  };

export { elements, launchViewer };  