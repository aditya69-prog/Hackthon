const Filter = require('bad-words');

const filter = new Filter();

// Add custom words to filter
const customBadWords = [
  // Add any institution-specific inappropriate terms here
];
filter.addWords(...customBadWords);

const checkToxicity = (text) => {
  if (!text || typeof text !== 'string') return { isToxic: false, cleaned: text };
  
  const isToxic = filter.isProfane(text);
  const cleaned = filter.clean(text);
  
  return {
    isToxic,
    cleaned,
    original: text
  };
};

const filterMessage = (text) => {
  if (!text || typeof text !== 'string') return text;
  return filter.clean(text);
};

module.exports = { checkToxicity, filterMessage };
