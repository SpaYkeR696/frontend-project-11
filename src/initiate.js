import parse from './parser.js';
import setUpdate from './update.js';
import request from './http.js';
import validate from './validation.js';

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

const initControl = (elements, state) => {
  initModal(elements, state);
  initPostContainer(elements, state);
  initForm(elements, state);
};

export default initControl;
