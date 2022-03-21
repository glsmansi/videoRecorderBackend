const express = require("express");
const catchAsync = require("../utils/catchAsync");
const router = express();
const dotenv = require("dotenv");
const multer = require("multer");
const user = require("../controllers/user");
dotenv.config();

const videoStorage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const videoUpload = multer({
  storage: videoStorage,
  // limits: {
  //   fileSize: 10000000, // 10000000 Bytes = 10 MB
  // },
  // fileFilter(req, file, cb) {
  //   // upload only mp4 and mkv format
  //   if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
  //     return cb(new Error("Please upload a video"));
  //   }
  //   cb(undefined, true);
  // },
});

router
  .route("/uploadVideo")
  .post(videoUpload.single("video"), catchAsync(user.uploadVideo));

router
  .route("/register")
  .get(catchAsync(user.getRegister))
  .post(catchAsync(user.postRegister));

router
  .route("/login")
  .get(catchAsync(user.getLogin))
  .post(catchAsync(user.postLogin));

router.route("/googleLogin").post(catchAsync(user.googleLogin));

router.route("/loginSuccess").get(catchAsync(user.loginSuccess));

router.route("/logout").get(user.logout);

module.exports = router;
