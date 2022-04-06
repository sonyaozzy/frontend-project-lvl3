export default (contents) => {
  const domparser = new DOMParser();

  return domparser.parseFromString(contents, 'application/xml');
};
