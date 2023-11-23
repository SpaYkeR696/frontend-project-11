export default (contents) => {
  const domParser = new DOMParser();
  const dom = domParser.parseFromString(contents, 'application/xml');
  console.log('dom', dom);

  const parseerror = dom.querySelector('parsererror');

  if (parseerror) {
    throw new Error('noRssError');
  } return dom;
};
