const sequelize = require("../database/connection");
const Sequelize = require("sequelize");
module.exports = sequelize.define(
  "Video",
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
    url: {
      type: Sequelize.STRING,
    },
    userEmail: {
      type: Sequelize.STRING(20),
    },
  },
  {
    timestamps: false,
  }
);
