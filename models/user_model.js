const { Sequelize, sequelize } = require('./db');
const department_model = require('./department_model');

const user_model = sequelize.define(
  'user_model',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    online: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: '用户是否在线'
    },
    socketId: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      comment: '用户登录后连接websocket的id'
    },
    username: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      comment: '用户名'
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: '用户密码'
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      comment: '用于websocket通信的token，登录后存放在localStorage'
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '用户的Email'
    },
    avatar: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '用户头像'
    }
  },
  {
    tableName: 'user',
    timestamps: true // 不默认增加 createdAt 字段
  }
);

// user_model.addHook('beforeCreate', (obj, options) => {
//   obj.createdAt = Date.now();
// });

// user_model.addHook('beforeUpdate', (obj, options) => {
//   obj.updatedAt = Date.now();
// });

user_model.belongsTo(department_model, { foreignKey: 'departmentId', as: 'department' });

module.exports = user_model;
