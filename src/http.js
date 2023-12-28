import axios from 'axios';

const createProxyUrl = (url) => {
  const newProxyURL = new URL('https://allorigins.hexlet.app');

  newProxyURL.pathname = '/get';
  newProxyURL.searchParams.append('disableCache', true);
  newProxyURL.searchParams.append('url', url);

  const resultingURL = newProxyURL.href.toString();

  return resultingURL;
};

const request = (url) => axios.get(createProxyUrl(url))
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

export default request;
