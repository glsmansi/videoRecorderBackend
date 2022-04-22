"use strict";

module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.renameColumn("Users", "username", "name"),
      queryInterface.renameColumn("Users", "loginType", "login_type"),
      queryInterface.renameColumn("Users", "profilePicture", "profile_picture"),
      queryInterface.renameColumn("Users", "isVerified", "is_verified"),
    ]);
  },

  down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.renameColumn("Users", "name", "username"),
      queryInterface.renameColumn("Users", "login_type", "loginType"),
      queryInterface.renameColumn("Users", "profile_picture", "profilePicture"),
      queryInterface.renameColumn("Users", "is_verified", "isVerified"),
    ]);
  },
};
