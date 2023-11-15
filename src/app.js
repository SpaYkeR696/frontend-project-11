import i18n from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import validate from './validation.js';
import { launchViewer, elements } from './viewer.js';
import ru from './locales/ru.js';
import parse from './parser.js';
import updateFeedsData from './updateFeed.js';
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
  
  const i18nInstanse = i18n.createInstance();

  i18nInstanse.init({
    lng: 'ru',
    debag: true,
    resourse: {
        ru,
    },
  })
    .then(() => {
      const wathedState = launchViewer(initialState);
      
      const addToState = (dom, url) => {
        const itemEls = dom.querySelectorAll('item');
        if (itemEls.length === 0) {
          wathedState.postValidationErrors.push('emptyRss');  
        };

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

        const postColl = items.map((item) => addPostData(item, currFeedId));
        data.currPosts = postColl;

        return data;  
      };
      
      const loadRss = (url) => {
        axios.get(addProxyToUrl(url))
          .then((response) => {
            wathedState.uiState.submitBlocked = false;

            const { contents } = response.data;
            const parsedDom = parse(contents);
            const extractedData = addToState(parsedDom, url);
            const { feed, currPosts} = extractedData;
            
            wathedState.feeds.push(feed);
            wathedState.posts = currPosts;

            wathedState.process = 'rssLoaded';
            wathedState.process = '';
          })
          .catch((err) => {
            wathedState.uiState.submitBlocked = false;
            console.log(err.message, 'err message catch', 'err', err);
            wathedState.postValidationErrors.push(err.message);
            throw new Error(err);
          });
      };

      elements.from.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const validatedUrls = wathedState.feeds.map((item) => item.feedUrl);

        validate(validatedUrls, url)
          .then((validatedUrl) => {
            wathedState.uiState.sabmitBlocked = true;
            loadRss(validatedUrl);
          })
          .catch((err) => {
            wathedState.validationProcess.error = err.errors;
            wathedState.process = 'validationFail';
            wathedState.process = '';
            throw new Error('validation');
          });
      }, true);

      elements.postsContainer.addEventListener('click', (e) => {
        const { target } = e;
        const shownPostId = target.dataSet.id;
        if (!shownPostId) {
          return;
        };
        wathedState.shown.push(shownPostId);
        wathedState.activePost = shownPostId;
      });

      const launchUpdate = (state) => {
        const promises = state.feeds.map((item) => {
          const { feedUrl } = item;
          const promise = updateFeedsData(feedUrl, state);
          return promise;
        });
        Promise.all(promises).then(() => setTimeout(launchUpdate, 5000, wathedState));
      };
      launchUpdate(wathedState); 
    });
};

export default app;
