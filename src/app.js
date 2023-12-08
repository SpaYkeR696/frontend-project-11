import onChange from 'on-change';
import i18next from 'i18next';
import validate from './validation.js';
import watch from './viewer.js';
import ru from './locales/ru.js';
import parse from './parser.js';
import setUpdate from './update.js';
import request from './http.js';
import { initialState, elements } from './modules.js';


  const initiateModal = (elements, state) => {
    elements.modal.addEventListener('show.bs.modal', (event) => {
      const { id } = event.relatedTarget.dataset;
      const post = state.content.posts.find(({ postId}) => postId === id);
      const { postTitle, postLink, postDescription } = post;
      
      elements.modalTitle.textContent = postTitle;
      elements.modalText.textContent = postDescription;
      elements.modalLink.href = postLink;
    });
  };

  const initiatePostContainer = (elements, state) => {
    elements.postContainer.addEventListener('click', (event) => {
      if (event.target.matches('[data-id]')) {
        const { id } = event.target.dataset;
        state.ui.posts.add(id);
      }
    });
  };

  const initiateForm = (elements, state) => {
    elements.form.addEventListener('submit', (event) => {
      event.preventDefault();
      state.form.errors = {};
      
      const formData = new FormData(event.target);

      [...formData.entries()].forEach(([key, value]) => {
        state.form.fields[key] = value.trim();
      });

      validate(state)
        .then(() => {
            state.form.status = 'fetching';
            return request(state.form.fields.url);
        })
        .then(parse)
        .then(([feed, posts]) => {
          state.form.status = 'success';
          state.content.feeds.unshift(feed);
          state.content.posts.unshift(...posts);
          state.urls.push({
            url: state.form.fields.url,
            id: feed.feedId,
          });
        })
        .then(() => setUpdate(request, parse, state))
        .catch((error) => {
            state.form.errors = error.errors;
            state.form.status = 'error';
        });
    });
  };

const initiateControl = (elements, state) => {
  initiateModal(elements, state);
  initiatePostContainer(elements, state);
  initiateForm(elements, state);
}

const app = () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  })
    .then(() => {
      const state = onChange(initialState, (path, value, _, applyData) => {
        watch(path, value, applyData, elements, state, i18nextInstance);
      });

      initiateControl(elements,state);
    });
};

export default app;
