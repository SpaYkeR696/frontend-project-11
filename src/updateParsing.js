import _ from 'lodash';

export default (contents, viewer) => { 
    const domParser = new DOMParser();
    const dom = domParser.parseFromString(contents, 'application/xml');
  
    const titleFeed = dom.querySelector('title').textContent;
  
    const items = Array.from(dom.querySelectorAll('item'));
  
    const { feeds, posts } = viewer;
  
    const currFeed = feeds.find((item) => item.title === titleFeed);
  
    const currFeedId = currFeed.id;
  
    const postsInState = posts.filter((post) => post.fId === currFeedId);
  
    const postTitles = postsInState.map((post) => post.title);
  
    const newPosts = [];
  
    const addPostData = (postEl, feedId) => {
      const newItem = {
        fId: feedId,
        id: _.uniqueId(''),
        title: postEl.querySelector('title').textContent,
        description: postEl.querySelector('description').textContent,
        link: postEl.querySelector('link').textContent,
      };
      newPosts.push(newItem);
  
      viewer.posts.push(newItem);
    };
  
    items.forEach((item) => {
      const titleEl = item.querySelector('title');
      const titleText = titleEl.textContent;
  
      if (!postTitles.includes(titleText)) {
        addPostData(item, currFeedId);
      }
    });
  
    const currentShownFeed = feeds[feeds.length - 1];
    const idOfShown = currentShownFeed.id;
  
    console.log('is Empty newposts?', (_.isEmpty(newPosts)));
  
    if (!_.isEmpty(newPosts) && newPosts[0].fId === idOfShown) {
      viewer.process = 'rssUpdated';
      viewer.process = '';
    }
  };