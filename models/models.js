const fs = require('fs');
const path = require('path');
const { sequelize } = require('./db');

let files = fs.readdirSync(path.join(__dirname));

let js_files = files.filter((f) => {
  return f.endsWith('.js');
}, files);

module.exports = {};

for (let f of js_files) {
  let name = f.substring(0, f.length - 3);
  if (name !== 'db' && name !== 'models') {
    module.exports[name] = require(path.join(__dirname, f));
  }
}

module.exports.sync = () => {
  // sequelize.sync({
  //   alter: process.env.NODE_ENV === 'development' ? true : false
  // });
  // sequelize.sync({ alter: true });
  sequelize.sync({});
};
