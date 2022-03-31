const express = require("express");
const catchAsync = require("../../utils/catchAsync");
const router = express();
const dotenv = require("dotenv");
const multer = require("multer");
const user = require("../controllers/user");
const auth = require("../middleware/auth");
// const ExpressError = require("../utils/ExpressError");
dotenv.config();

const videoStorage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const videoUpload = multer({
  storage: videoStorage,
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

router.route("/googleLogin").post(catchAsync(user.googleLogin));

router.route("/my-video").get(catchAsync(user.loginSuccess));
router.route("/setting").get(catchAsync(user.setting));
router.route("/userDetails").get(auth, catchAsync(user.userDetails));

router.route("/home/videos/:id").get(catchAsync(user.userVideoLink));

router.route("/sharedWithMe").get(auth, user.sharedWithMe);
router.route("/sharedWithOthers").get(auth, user.sharedWithOthers);
router.route("/personal").get(auth, user.personal);

router.route("/logout").get(user.logout);

module.exports = router;

// router.route("/slack/install").get(catchAsync(user.slackInstall));

// router.route("/slack/oauth_redirect").get(catchAsync(user.oauthRedirect));

// router.route("/slackLogin").post(catchAsync(user.slackLogin));
