const elements = {
  form: document.querySelector('#form'),
  submit: document.querySelector('#submit'),
  urlInput: document.querySelector('#url-input'),
  feedback: document.querySelector('#feedback'),
  postContainer: document.querySelector('#posts'),
  feedContainer: document.querySelector('#feeds'),
  modal: document.querySelector('#modal'),
  modalTitle: document.querySelector('#modal-title'),
  modalText: document.querySelector('#modal-text'),
  modalLink: document.querySelector('#modal-link'),
};

const initialState = {
  content: {
    feeds: [],
    posts: [],
  },
  ui: {
    posts: new Set(),
  },
  urls: [],
  form: {
    status: null,
    fields: {},
    errors: {},
  },
  timeoutId: null,
};

export { elements, initialState };
