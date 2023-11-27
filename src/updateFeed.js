import axios from 'axios';
import updateParsing from './updateParsing.js';

const addProxyToUrl = (href) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(href)}`;

const updateFeedsData = (href, viewer) => {
  const promise = axios.get(addProxyToUrl(href))

    .then((response) => {
      const { contents } = response.data;

      updateParsing(contents, viewer);
    })
    .catch(() => {
      viewer.postValidationErrors.push('Network Error');
    });
  return promise;
};

export default updateFeedsData;
