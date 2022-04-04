"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn("Videos", "meetingNotes", {
      type: Sequelize.STRING(1000),
    });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.removeColumn("Videos", "meetingNotes");
  },
};
