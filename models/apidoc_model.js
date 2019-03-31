const { Sequelize, sequelize } = require('./db');

const project_model = require('./project_model');
const user_model = require('./user_model');

const apidoc_model = sequelize.define(
  'apidoc_model',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: '接口项目名'
    },
    path: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: '接口路径，不带域名以/开头'
    },
    method: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: '接口请求类型',
      defaultValue: 'GET'
    },
    params: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '请求参数，存的是一段json'
    },
    returnContent: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '请求参数，存的是一段json'
    }
  },
  {
    tableName: 'apidoc',
    timestamps: true // 不默认增加 createdAt 字段
  }
);

// department_model.addHook('beforeCreate', (obj, options) => {
//   obj.createdAt = Date.now();
// });

// department_model.addHook('beforeUpdate', (obj, options) => {
//   obj.updatedAt = Date.now();
// });

apidoc_model.belongsTo(project_model, { foreignKey: 'projectId', as: 'project' });
apidoc_model.belongsTo(user_model, { foreignKey: 'userId', as: 'user' });

module.exports = apidoc_model;
