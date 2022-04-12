"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.changeColumn("UserVideos", "teamMembers", {
      type: Sequelize.STRING(255),
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn("UserVideos", "teamMembers", {
      type: Sequelize.STRING,
    });
  },
};
