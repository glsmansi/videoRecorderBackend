const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB,
  process.env.USER_NAME,
  process.env.PASSWORD,
  {
    host: "scrapdb2.crbyejbc1y6i.ap-south-1.rds.amazonaws.com",
    dialect: "mysql",
  }
);

module.exports = sequelize;
