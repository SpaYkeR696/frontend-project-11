import i18n from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import validate from './validation.js';
import { launchViewer, elements } from './viewer.js';
import ru from './locales/ru.js';
import parse from './parser.js';
import updateFeedData from './updateFeed.js';

import 'bootstrap';

const addProxyToUrl = (href) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(href)}`;

const app = () => {
  const initialState = {

    process: 'default',
    activePost: '',
    validationProcess: {
      error: '',
    },
    postValidationErrors: [],
    feeds: [],
    posts: [],
    shown: [],
    uiState: {
      submitBlocked: false,
    },

  };

  const i18nInstance = i18n.createInstance();

  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  })
    .then(() => {
      const watchedState = launchViewer(initialState);

      const addDataToState = (dom, url) => {
        const itemEls = dom.querySelectorAll('item');
        if (itemEls.length === 0) {
          watchedState.postValidationErrors.push('emptyRss');
        }

        const items = Array.from(dom.querySelectorAll('item'));
        const data = {

          feed: {
            title: dom.querySelector('title').textContent,
            id: _.uniqueId('f'),
            description: dom.querySelector('description').textContent,
            link: dom.querySelector('link').textContent,
            feedUrl: url,
          },
        };

        const currFeedId = data.feed.id;

        const addPostData = (postEl, feedId) => ({
          fId: feedId,
          id: _.uniqueId(''),
          title: postEl.querySelector('title').textContent,
          description: postEl.querySelector('description').textContent,
          link: postEl.querySelector('link').textContent,
        });
        const postsColl = items.map((item) => addPostData(item, currFeedId));
        data.currPosts = postsColl;

        return data;
      };

      const loadRss = (url) => {
        axios.get(addProxyToUrl(url))
          .then((response) => {
            watchedState.uiState.submitBlocked = false;

            const { contents } = response.data;

            const parsedDom = parse(contents);

            const extractedData = addDataToState(parsedDom, url);

            const { feed, currPosts } = extractedData;

            watchedState.feeds.push(feed);
            watchedState.posts = currPosts;

            watchedState.process = 'rssLoaded';
            watchedState.process = '';
          })

          .catch((err) => {
            watchedState.uiState.submitBlocked = false;
            console.log(err.message, 'err message catch', 'err', err);
            watchedState.postValidationErrors.push(err.message);
            throw new Error(err);
          });
      };

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const validatedUrls = watchedState.feeds.map((item) => item.feedUrl);

        validate(validatedUrls, url)

          .then((validatedUrl) => {
            watchedState.uiState.submitBlocked = true;
            loadRss(validatedUrl);
          })
          .catch((err) => {
            watchedState.validationProcess.error = err.errors;
            watchedState.process = 'validationFail';
            watchedState.process = '';
            throw new Error('validation');
          });
      }, true);

      elements.postsContainer.addEventListener('click', (e) => {
        const { target } = e;

        const shownPostId = target.dataset.id;
        if (!shownPostId) {
          return;
        }
        watchedState.shown.push(shownPostId);
        watchedState.activePost = shownPostId;
      });

      const launchUpdate = (state) => {
        const promises = state.feeds.map((item) => {
          const { feedUrl } = item;
          const promise = updateFeedData(feedUrl, state);
          return promise;
        });
        Promise.all(promises).then(() => setTimeout(launchUpdate, 5000, watchedState));
      };
      launchUpdate(watchedState);
    });
};

export default app;
