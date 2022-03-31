const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const auth = async (req, res, next) => {
  try {
    // const token = req.cookies.cookietokenkey;
    const token = req.headers.auth;

    console.log(token);

    if (!token) {
      return res.redirect("/login");
      // return console.log("error");
    }
    console.log(process.env.TOKEN_KEY);
    const data = await jwt.verify(token, process.env.TOKEN_KEY);
    req.user = data;
    console.log(data);
    next();
    // console.log(data);
  } catch (e) {
    console.log(e);
  }
};

const midd = (req, res, next) => {
  try {
    console.log("mansi");
    next();
  } catch (e) {
    console.log(e);
  }
};
module.exports = auth;
