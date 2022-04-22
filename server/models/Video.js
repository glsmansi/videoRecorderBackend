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
    title: {
      type: Sequelize.STRING(255),
    },
    url: {
      type: Sequelize.STRING,
    },
    user_id: {
      type: Sequelize.INTEGER(11),
    },
    status: {
      type: Sequelize.STRING,
    },

    notes: {
      type: Sequelize.TEXT("long"),
    },
  },
  {
    timestamps: false,
  }
);
