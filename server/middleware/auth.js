const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const isAuth = async (req, res, next) => {
  console.log(req.session);
  if (req.session.isAuth) {
    console.log("dfdfdgvfgvdfgvdf");
    next();
  } else {
    console.log("not authenticated");
    console.log(req.session);
    res.redirect("/login");
  }
};

module.exports = isAuth;
