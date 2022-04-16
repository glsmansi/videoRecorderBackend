const express = require("express");
const catchAsync = require("../../utils/catchAsync");
const router = express();
const dotenv = require("dotenv");
const multer = require("multer");
const user = require("../controllers/user");
const isAuth = require("../middleware/auth");
// const ExpressError = require("../utils/ExpressError");
dotenv.config();

const videoStorage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});
const profilePicStorage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const videoUpload = multer({
  storage: videoStorage,
});
const profilePicUpload = multer({
  storage: profilePicStorage,
});

router
  .route("/uploadVideo")
  .post(isAuth, videoUpload.single("video"), catchAsync(user.uploadVideo));

router
  .route("/register")
  .get(catchAsync(user.getRegister))
  .post(catchAsync(user.postRegister));

router.route("/validate").post(catchAsync(user.emailVerification));

router
  .route("/login")
  .get(catchAsync(user.getLogin))
  .post(catchAsync(user.postLogin));

router.route("/googleLogin").post(catchAsync(user.googleLogin));

router.route("/home").get(isAuth, catchAsync(user.personal));
router.route("/settings").get(isAuth, catchAsync(user.settings));
router.route("/userDetails").get(isAuth, catchAsync(user.userDetails));

router.route("/:id/watch").get(catchAsync(user.userVideoLink));
router
  .route("/:id/watch/publicOrPrivate")
  .post(isAuth, catchAsync(user.publicOrPrivate));

router
  .route("/:id/watch/teamMembers/add")
  .post(isAuth, catchAsync(user.AddteamMembers));

router
  .route("/:id/watch/teamMembers/delete")
  .delete(isAuth, catchAsync(user.DeleteteamMembers));

router
  .route("/:id/watch/meetingNotes")
  .post(isAuth, catchAsync(user.meetingNotes));
router
  .route("/:id/watch/meetingNotes/delete")
  .delete(isAuth, catchAsync(user.meetingNotes));

router
  .route("/:id/watch/changeFileName")
  .post(isAuth, catchAsync(user.changeFileName));

// router
//   .route("/:id/copyLinkToClipboard")
//   .post(isAuth, catchAsync(user.copyLinkToClipBoard));

// router.route("/:id/publicLink/sharable").get(user.publicSharableLink);

router.route("/me").get(isAuth, user.sharedWithMe);
router.route("/team").get(isAuth, user.sharedWithOthers);
router.route("/downloadVideo").get(isAuth, user.downloadVideo);

router.route("/changeUsername").post(isAuth, user.changeUserName);
router.route("/changePassword").post(isAuth, user.changePassword);
router
  .route("/uploadPhoto")
  .post(isAuth, profilePicUpload.single("mypic"), user.uploadPhoto);

router.route("/removeProfilePic").get(isAuth, user.removeProfilePic);

router.route("/logout").get(user.logout);

module.exports = router;

// router.route("/slack/install").get(catchAsync(user.slackInstall));

// router.route("/slack/oisAuth_redirect").get(catchAsync(user.oauthRedirect));

// router.route("/slackLogin").post(catchAsync(user.slackLogin));
