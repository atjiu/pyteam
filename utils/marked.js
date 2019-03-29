const marked = require('marked');

marked.setOptions({
  breaks: true,
  gfw: true
});

module.exports = marked;
