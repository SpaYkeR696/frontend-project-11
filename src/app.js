/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable import/extensions */
import i18next from 'i18next';
import ru from './locales/ru.js';
import { elements } from './modules.js';
import parse from './parser.js';
import setUpdate from './update.js';
import request from './http.js';
import validate from './validation.js';
import initState from './viewer.js';

const app = () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance
    .init({
      lng: 'ru',
      debug: true,
      resources: {
        ru,
      },
    })
    .then(() => {
      const initModal = (elements, state) => {
        elements.modal.addEventListener('show.bs.modal', (event) => {
          const { id } = event.relatedTarget.dataset;
          const post = state.content.posts.find(({ postId }) => postId === id);
          const { postTitle, postLink, postDescription } = post;

          elements.modalTitle.textContent = postTitle;
          elements.modalText.textContent = postDescription;
          elements.modalLink.href = postLink;
        });
      };

      const initPostContainer = (elements, state) => {
        elements.postContainer.addEventListener('click', (event) => {
          if (event.target.matches('[data-id]')) {
            const { id } = event.target.dataset;
            state.ui.posts.add(id);
          }
        });
      };

      const initForm = (elements, state) => {
        elements.form.addEventListener('submit', (event) => {
          event.preventDefault();
          state.form.errors = {};

          const formData = new FormData(event.target);

          [...formData.entries()].forEach(([key, value]) => {
            state.form.fields[key] = value.trim();
          });
          state.form.status = 'fetching';
          validate(state.form.fields, state.urls)
            .then(() => request(state.form.fields.url))
            .then((data) => {
              const [feed, posts] = parse(data);
              state.content.feeds.unshift(feed);
              state.content.posts.unshift(...posts);
              state.urls.push({
                url: state.form.fields.url,
                id: feed.feedId,
              });
              setUpdate(request, parse, state);
              state.form.status = 'success';
            })
            .catch((error) => {
              state.form.errors = error.inner.reduce((accumulator, item) => {
                const { path, message } = item;
                return ({ ...accumulator, [path]: message.key });
              }, {});
              state.form.status = 'error';
            });
        });
      };

      const initControl = (elements, state) => {
        initModal(elements, state);
        initPostContainer(elements, state);
        initForm(elements, state);
      };

      const state = initState(i18nextInstance);

      initControl(elements, state);
    });
};

export default app;
