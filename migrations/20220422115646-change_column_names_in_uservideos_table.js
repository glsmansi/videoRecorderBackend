"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.renameColumn("UserVideos", "userEmail", "user_email"),
      queryInterface.renameColumn("UserVideos", "videoId", "video_id"),
      queryInterface.renameColumn("UserVideos", "teamMembers", "team_members"),
    ]);
  },

  down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.renameColumn("UserVideos", "user_email", "userEmail"),
      queryInterface.renameColumn("UserVideos", "video_id", "videoId"),
      queryInterface.renameColumn("UserVideos", "team_members", "teamMembers"),
    ]);
  },
};
