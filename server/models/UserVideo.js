const sequelize = require("../database/connection");
const Sequelize = require("sequelize");
module.exports = sequelize.define(
  "UserVideo",
  {
    id: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    userEmail: {
      type: Sequelize.STRING,
    },
    videoId: {
      type: Sequelize.INTEGER,
    },
    teamMembers: {
      type: Sequelize.STRING(1000),
    },
  },
  {
    timestamps: false,
  }
);
