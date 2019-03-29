const { Sequelize, sequelize } = require('./db');
const user_model = require('./user_model');
const task_model = require('./task_model');

const task_dynamic_model = sequelize.define(
  'task_dynamic_model',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    content: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: '任务动态内容'
    }
  },
  {
    tableName: 'task_dynamic',
    timestamps: true // 不默认增加 createdAt 字段
  }
);

// task_dynamic_model.addHook('beforeCreate', (obj, options) => {
//   obj.createdAt = Date.now();
// });

// task_dynamic_model.addHook('beforeUpdate', (obj, options) => {
//   obj.updatedAt = Date.now();
// });

task_dynamic_model.belongsTo(task_model, { foreignKey: 'taskId', as: 'task' });
task_dynamic_model.belongsTo(user_model, { foreignKey: 'userId', as: 'user' });

module.exports = task_dynamic_model;
