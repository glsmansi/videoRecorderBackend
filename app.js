const express = require("express");
const path = require("path");
const port = process.env.PORT || 5000;
const ExpressError = require("./utils/ExpressError");
const dotenv = require("dotenv");
const catchAsync = require("./utils/catchAsync");
dotenv.config();
const cookieParser = require("cookie-parser");
const user = require("./server/controllers/user");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
var SequelizeStore = require("connect-session-sequelize")(session.Store);
// const isAuth = require("./server/middleware/auth");

// const fileUpload = require("express-fileupload");
//const expressLayouts=require('express-ejs-layouts')

const userRouter = require("./server/routes/user");

const sequelize = require("./server/database/connection");
sequelize
  .authenticate()
  .then(() => console.log("Connected to Sequelize"))
  .catch((e) => {
    console.log(e);
  });

const app = express();

var myStore = new SequelizeStore({
  db: sequelize,
});

app.set("view engine", "ejs");
app.use(expressLayouts);

app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "./public")));

app.use(
  session({
    secret: process.env.TOKEN_KEY,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true, maxAge: 3600 * 60 * 60 * 24 },
    store: myStore,
  })
);

myStore.sync();

app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId;
  next();
});

app.use("/", userRouter);

app.route("/").get(catchAsync(user.home));

// app.all("*", (req, res, next) => {
//   next(new ExpressError("Page Not Found", 404));
// });

app.use((err, req, res, next) => {
  const { statusCode = 400 } = err;
  if (err.message == "") err.message = "Something went wrong";
  //   res.status(statusCode).send(err);
  console.log(err);
  res.status(statusCode).send(err);
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});

// password : G5YVxqg3l8C9X5AE
// username : atg-meet
// host : scrapdb2.crbyejbc1y6i.ap-south-1.rds.amazonaws.com
// database : atg-meet
