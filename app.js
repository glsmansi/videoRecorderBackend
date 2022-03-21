const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const mongoose = require("mongoose");
const ExpressError = require("./utils/ExpressError");
const dotenv = require("dotenv");
const catchAsync = require("./utils/catchAsync");
const cookieParser = require("cookie-parser");

dotenv.config();

const userRouter = require("./routes/user");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/extension";
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongodb connected"))
  .catch((e) => console.log(e));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "./public")));

app.use("/", userRouter);

app.get(
  "/",
  catchAsync(async (req, res) => {
    res.render("home");
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 400 } = err;
  if (err.message == "") err.message = "Something went wrong";
  //   res.status(statusCode).send(err);
  console.log(err);
  res.status(statusCode).render("error", { err });
});

app.listen(port, () => {
  console.log(`Connected to port ${port}`);
});
