const { Sequelize, sequelize } = require('./db');

const user_model = require('./user_model');
const project_model = require('./project_model');

const project_user_model = sequelize.define(
  'project_user_model',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    }
    // userId: {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   comment: '用户id'
    // },
    // projectId: {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   comment: '项目的id'
    // }
  },
  {
    tableName: 'project_user',
    timestamps: true // 不默认增加 createdAt 字段
  }
);

// project_user_model.addHook('beforeCreate', (obj, options) => {
//   obj.createdAt = Date.now();
// });

// project_user_model.addHook('beforeUpdate', (obj, options) => {
//   obj.updatedAt = Date.now();
// });

project_user_model.belongsTo(user_model, { foreignKey: 'userId', as: 'user' });
project_user_model.belongsTo(project_model, { foreignKey: 'projectId', as: 'project' });

module.exports = project_user_model;
