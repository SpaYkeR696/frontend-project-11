import axios from "axios";
import { object, string, setLocale } from "yup";

const createProxyUrl = (url) =>
  `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
    url
  )}`;

const request = (url) =>
  axios
    .get(createProxyUrl(url))
    .then((response) => response.data.contents)
    .catch((error) => {
      const networkErrors = {};

      if (error.response) {
        networkErrors.url = 'errors.network.invalidStatus';
      } else {
        networkErrors.url = 'errors.network.invalidResponse';
      }

      const newError = new Error();
      newError.errors = networkErrors;

      throw newError;
    });

const createFeedData = (document, feedId) => {
  const feedTitle = document.querySelector('channel > title');
  const feedDescription = document.querySelector('channel > description');

  const feed = {
    feedTitle: feedTitle.textContent,
    feedDescription: feedDescription.textContent,
    feedId,
  };

  return feed;
};

const createPostsData = (document, feedId) => {
  const posts = [];
  const items = document.querySelectorAll('item');

  [...items].forEach((item) => {
    const postTitle = item.querySelector('title');
    const postLink = item.querySelector('link');
    const postDescription = item.querySelector('description');
    const postGuid = item.querySelector('guid');
    const parentFeedId = feedId;
    const postId = crypto.randomUUID();

    posts.push({
      postTitle: postTitle.textContent,
      postLink: postLink.textContent,
      postDescription: postDescription.textContent,
      postGuid: postGuid.textContent,
      parentFeedId,
      postId,
    });
  });

  return posts;
};

const parse = (data, id) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, 'text/xml');
  const parserError = document.querySelector('parsererror');

  if (parserError) {
    const parsingErrors = {};
    parsingErrors.url = 'errors.parsing.invalidRss';

    const newError = new Error();
    newError.errors = parsingErrors;

    throw newError;
  }

  const feedId = id || crypto.randomUUID();
  const feed = createFeedData(document, feedId);
  const posts = createPostsData(document, feedId);

  return [feed, posts];
};

const TIMEOUT = 5000;

const update = (url, id, request, parse, state) =>
  request(url)
    .then((data) => parse(data, id))
    .then(([, posts]) => {
      const postsForFeed = state.content.posts.filter(
        ({ parentFeedId }) => parentFeedId === id
      );
      const postGuids = postsForFeed.map(({ postGuid }) => postGuid);
      const newPosts = posts.filter(
        ({ postGuid }) => !postGuids.includes(postGuid)
      );

      state.content.posts.unshift(...newPosts);

      return Promise.resolve(newPosts);
    })
    .catch((error) => Promise.reject(error.errors));

const updateAll = (request, parse, state) =>
  Promise.resolve(state.urls).then((urls) => {
    const requests = urls.map(({ url, id }) =>
      update(url, id, request, parse, state)
    );
    return Promise.allSettled(requests);
  });

const setUpdate = (request, parse, state) => {
  clearTimeout(state.timeoutId);

  state.timeoutId = setTimeout(() => {
    updateAll(request, parse, state).then(() =>
      setUpdate(request, parse, state)
    );
  }, TIMEOUT);
};

setLocale({
  string: {
    url: () => ({ key: 'errors.validation.validUrl' }),
  },
});

const schema = object().shape({
  url: string().url().required(),
});

const validateUniqueness = (state) => {
  const urls = state.urls.map(({ url }) => url);

  if (urls.includes(state.form.fields.url)) {
    const error = new Error();
    error.inner = [
      {
        path: 'url',
        message: { key: 'errors.validation.duplicateUrl' },
      },
    ];

    throw error;
  }
};

const validate = (state) =>
  schema
    .validate(state.form.fields, { abortEarly: false })
    .then(() => validateUniqueness(state))
    .catch((error) => {
      const validationErrors = error.inner.reduce((accumulator, item) => {
        const { path, message } = item;
        return { ...accumulator, [path]: message.key };
      }, {});

      const newError = new Error();
      newError.errors = validationErrors;

      throw newError;
    });

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
