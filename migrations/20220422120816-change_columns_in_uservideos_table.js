"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn("UserVideos", "user_email", {
        type: Sequelize.STRING(255),
      }),
      queryInterface.changeColumn("UserVideos", "video_id", {
        type: Sequelize.INTEGER(11),
      }),
    ]);
  },

  down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn("UserVideos", "user_email", {
        type: Sequelize.STRING,
      }),
      queryInterface.changeColumn("UserVideos", "video_id", {
        type: Sequelize.INTEGER,
      }),
    ]);
  },
};
