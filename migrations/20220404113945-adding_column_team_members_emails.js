"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn("UserVideos", "teamMembers", {
      type: Sequelize.STRING(1000),
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn("UserVideos", "teamMembers");
  },
};
