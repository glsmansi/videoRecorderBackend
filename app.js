const express = require("express");
const path = require("path");
const port = process.env.PORT || 5000;
const ExpressError = require("./utils/ExpressError");
const dotenv = require("dotenv");
const catchAsync = require("./utils/catchAsync");
dotenv.config();
const cookieParser = require("cookie-parser");
const user = require("./server/controllers/user");

const userRouter = require("./server/routes/user");

const sequelize = require("./server/database/connection");

sequelize
  .authenticate()
  .then(() => console.log("Connected to Sequelize"))
  .catch((e) => {
    console.log(e);
  });

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "./public")));

app.use("/", userRouter);

app.route("/").get(catchAsync(user.home));

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

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
