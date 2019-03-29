const { Sequelize, sequelize } = require('./db');
const user_model = require('./user_model');
const project_model = require('./project_model');

const task_model = sequelize.define(
  'task_model',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: '任务标题'
    },
    intro: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '任务介绍'
    },
    // creator: {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   comment: '任务创建者'
    // },
    // executor: {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   comment: '任务执行者'
    // },
    // projectId: {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   comment: '项目ID'
    // },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: '任务状态'
    },
    deadline: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: '截止日期，如果为null则无限时间'
    }
  },
  {
    tableName: 'task',
    timestamps: true // 不默认增加 createdAt 字段
  }
);

// task_model.addHook('beforeCreate', (obj, options) => {
//   obj.createdAt = Date.now();
// });

// task_model.addHook('beforeUpdate', (obj, options) => {
//   obj.updatedAt = Date.now();
// });

task_model.belongsTo(user_model, { foreignKey: 'creator', as: 'creatorUser' });
task_model.belongsTo(user_model, { foreignKey: 'executor', as: 'executorUser' });
task_model.belongsTo(project_model, { foreignKey: 'projectId', as: 'project' });

module.exports = task_model;
