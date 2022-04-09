const sequelize = require("../database/connection");
const Sequelize = require("sequelize");
module.exports = sequelize.define(
  "User",
  {
    id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: Sequelize.STRING(100),
    },
    email: {
      type: Sequelize.STRING(100),
      unique: true,
    },
    password: {
      type: Sequelize.STRING(100),
    },
    loginType: {
      type: Sequelize.STRING,
    },
    token: {
      type: Sequelize.STRING,
    },
    // profilePicture: {
    //   type: Sequelize.STRING(1000),
    // },
  },
  {
    timestamps: false,
  }
);
