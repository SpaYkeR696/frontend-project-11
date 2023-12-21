const TIMEOUT = 5000;

const update = (url, id, request, parse, state) => request(url)
  .then((data) => parse(data, id))
  .then(([, posts]) => {
    const postsForFeed = state.content.posts.filter(({ parentFeedId }) => parentFeedId === id);
    const postGuids = postsForFeed.map(({ postGuid }) => postGuid);
    const newPosts = posts.filter(({ postGuid }) => !postGuids.includes(postGuid));

    state.content.posts.unshift(...newPosts);

    return Promise.resolve(newPosts);
  })
  .catch((error) => Promise.reject(error.errors));

const updateAll = (request, parse, state) => Promise.resolve(state.urls)
  .then((urls) => {
    const requests = urls.map(({ url, id }) => update(url, id, request, parse, state));
    return Promise.allSettled(requests);
  });

const setUpdate = (request, parse, state) => {
  clearTimeout(state.timeoutId);

  state.timeoutId = setTimeout(() => {
    updateAll(request, parse, state)
      .then(() => setUpdate(request, parse, state));
  }, TIMEOUT);
};

export default setUpdate;
