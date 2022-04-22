"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.renameColumn("Videos", "fileName", "title"),
      queryInterface.renameColumn("Videos", "userId", "user_id"),
      queryInterface.renameColumn("Videos", "meetingNotes", "notes"),
    ]);
  },

  down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.renameColumn("Videos", "title", "fileName"),
      queryInterface.renameColumn("Videos", "user_id", "userId"),
      queryInterface.renameColumn("Videos", "notes", "meetingNotes"),
    ]);
  },
};
