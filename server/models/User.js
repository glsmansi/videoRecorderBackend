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
    name: {
      type: Sequelize.STRING(100),
    },
    email: {
      type: Sequelize.STRING(100),
      unique: true,
    },
    password: {
      type: Sequelize.STRING(100),
    },
    login_type: {
      type: Sequelize.STRING,
    },

    profile_picture: {
      type: Sequelize.STRING(1000),
      allowNull: true,
    },
    is_verified: {
      type: Sequelize.BOOLEAN,
    },
    token: {
      type: Sequelize.STRING(255),
    },
  },
  {
    timestamps: false,
  }
);
