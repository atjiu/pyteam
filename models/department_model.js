const { Sequelize, sequelize } = require('./db');

const department_model = sequelize.define(
  'department_model',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: '部门名'
    },
    userCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '员工数'
    }
  },
  {
    tableName: 'department',
    timestamps: true // 不默认增加 createdAt 字段
  }
);

// department_model.addHook('beforeCreate', (obj, options) => {
//   obj.createdAt = Date.now();
// });

// department_model.addHook('beforeUpdate', (obj, options) => {
//   obj.updatedAt = Date.now();
// });

module.exports = department_model;
