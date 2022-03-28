const express = require("express");
const catchAsync = require("../utils/catchAsync");
const router = express();
const dotenv = require("dotenv");
const multer = require("multer");
const user = require("../controllers/user");
const auth = require("../middleware/auth");
const ExpressError = require("../utils/ExpressError");
dotenv.config();

const videoStorage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const videoUpload = multer({
  storage: videoStorage,
  // fileFilter(req, file, cb) {
  // upload only mp4 and mkv format
  //   if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
  //     return new ExpressError("Please upload a video");
  //   }
  //   cb(undefined, true);
  // },
});

router
  .route("/uploadVideo")
  .post(auth, videoUpload.single("video"), catchAsync(user.uploadVideo));

router
  .route("/register")
  .get(catchAsync(user.getRegister))
  .post(catchAsync(user.postRegister));

router
  .route("/login")
  .get(catchAsync(user.getLogin))
  .post(catchAsync(user.postLogin));

//temperory
router.get('/admin', (req, res) => {
  res.render('user/admin')
})
//over

router.route("/googleLogin").post(catchAsync(user.googleLogin));

router.route("/loginSuccess").get(auth, catchAsync(user.loginSuccess));
router.route("/userDetails").get(auth, catchAsync(user.userDetails));

router.route("/logout").get(user.logout);

module.exports = router;
