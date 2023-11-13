export default (content) => {
  const domParser = new DOMParser();
  const dom = domParser.parseFromString(content, 'application/xml');
  console.log('dom', dom);

  const parserError = dom.querySelector('parsererror');
  if(parserError) {
    throw new Error('noRssError');
  } return dom;
};