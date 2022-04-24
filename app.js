const express = require("express");
const path = require("path");
const ExpressError = require("./utils/ExpressError");
const dotenv = require("dotenv");
const catchAsync = require("./utils/catchAsync");
dotenv.config();
const cookieParser = require("cookie-parser");
const user = require("./server/controllers/user");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("connect-flash");
var SequelizeStore = require("connect-session-sequelize")(session.Store);
const config = require("./config");
const PORT = config.port;

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
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "./public")));

app.use(
  session({
    secret: process.env.SESSION_TOKEN_KEY,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true, maxAge: 3600 * 60 * 60 * 24 },
    store: myStore,
  })
);

myStore.sync();

app.use((req, res, next) => {
  res.locals.currentUser = req.session.userId;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRouter);

app.route("/").get(catchAsync(user.home));

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 400 } = err;
  if (err.message == "") err.message = "Something went wrong";
  //   res.status(statusCode).send(err);
  if (statusCode == 404) {
    return res.render("error", { title: "ERROR!" });
  }
  console.log(err);
  res.status(statusCode).send(err);
});

app.listen(PORT, () => {
  // console.log(`Listening to port ${port}`);
  console.log(
    "Listening on port: " + PORT + " in " + config.envName + " environment."
  );
});

// password : G5YVxqg3l8C9X5AE
// username : atg-meet
// host : scrapdb2.crbyejbc1y6i.ap-south-1.rds.amazonaws.com
// database : atg-meet
