const { Sequelize, sequelize } = require('./db');

const user_model = require('./user_model');

const chat_model = sequelize.define(
  'chat_model',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
      comment: '消息内容'
    },
    group: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      comment: '是否是群组',
      defaultValue: false
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: '消息类型' // text/image/other
    },
    targetUserId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: '接收消息的用户id'
    }
  },
  {
    tableName: 'chat',
    timestamps: true // 不默认增加 createdAt 字段
  }
);

// department_model.addHook('beforeCreate', (obj, options) => {
//   obj.createdAt = Date.now();
// });

// department_model.addHook('beforeUpdate', (obj, options) => {
//   obj.updatedAt = Date.now();
// });

chat_model.belongsTo(user_model, { foreignKey: 'userId', as: 'user' }); // 消息发出者
// chat_model.belongsTo(user_model, { foreignKey: 'targetUserId', as: 'targetUser', allowNull: true }); // 接收对象

module.exports = chat_model;
