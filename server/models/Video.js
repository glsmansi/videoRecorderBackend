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
    fileName: {
      type: Sequelize.STRING(20),
    },
  },
  {
    timestamps: true,
  }
);
