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

router.route("/home").get(auth, catchAsync(user.personal));
router.route("/settings").get(auth, catchAsync(user.settings));
router.route("/userDetails").get(auth, catchAsync(user.userDetails));

router.route("/:id/watch").get(auth, catchAsync(user.userVideoLink));
router
  .route("/:id/watch/publicOrPrivate")
  .post(auth, catchAsync(user.publicOrPrivate));

router
  .route("/:id/watch/teamMembers/add")
  .post(auth, catchAsync(user.AddteamMembers));

router
  .route("/:id/watch/teamMembers/delete")
  .delete(auth, catchAsync(user.DeleteteamMembers));

router
  .route("/:id/watch/meetingNotes")
  .post(auth, catchAsync(user.meetingNotes));
router
  .route("/:id/watch/meetingNotes/delete")
  .delete(auth, catchAsync(user.meetingNotes));

router.route("/me").get(auth, user.sharedWithMe);
router.route("/team").get(auth, user.sharedWithOthers);
router.route("/downloadVideo").get(auth, user.downloadVideo);

router.route("/logout").get(user.logout);

module.exports = router;

// router.route("/slack/install").get(catchAsync(user.slackInstall));

// router.route("/slack/oauth_redirect").get(catchAsync(user.oauthRedirect));

// router.route("/slackLogin").post(catchAsync(user.slackLogin));
