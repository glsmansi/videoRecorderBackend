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
    userId: {
      type: Sequelize.STRING(20),
    },
    status: {
      type: Sequelize.STRING,
    },
    teamMembers: {
      type: Sequelize.STRING(1000),
    },
    meetingNotes: {
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: false,
  }
);
