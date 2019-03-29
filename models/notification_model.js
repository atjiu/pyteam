const { Sequelize, sequelize } = require('./db');

const user_model = require('./user_model');
const task_model = require('./task_model');
const project_model = require('./project_model');

const notification_model = sequelize.define(
  'notification_model',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    content: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: '通知内容'
    }
  },
  {
    tableName: 'notification',
    timestamps: true // 不默认增加 createdAt 字段
  }
);

// project_model.addHook('beforeCreate', (obj, options) => {
//   obj.createdAt = Date.now();
// });

// project_model.addHook('beforeUpdate', (obj, options) => {
//   obj.updatedAt = Date.now();
// });

notification_model.belongsTo(user_model, { foreignKey: 'userId', as: 'user' });
notification_model.belongsTo(task_model, { foreignKey: 'taskId', as: 'task' });
notification_model.belongsTo(project_model, { foreignKey: 'projectId', as: 'project' });

module.exports = notification_model;
