const User = require("../models/User");
const UserVideo = require("../models/UserVideo");
const Video = require("../models/Video");
const ExpressError = require("../../utils/ExpressError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const uuid = require("uuid/v4");
const AWS = require("aws-sdk");
const sequelize = require("sequelize");
// var ncp = require("copy-paste");
const nodemailer = require("nodemailer");
const fs = require("fs");

// const alert = require("alert");

// Video.belongsTo(User, {
//   as: "videos",
//   foreignKey: "userEmail",
// });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const { OAuth2Client } = require("google-auth-library");
const CLIENT_ID =
  "198561696099-flasriqkqqlkn2db9ttq6ellso1g6kdn.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

module.exports.home = async (req, res) => {
  if (req.cookies["cookietokenkey"]) {
    res.redirect("/home");
  } else {
    res.render("home");
  }
};

module.exports.uploadVideo = async (req, res) => {
  console.log(req.body);
  console.log(req.file);
  try {
    let myFile = req.file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    // console.log(myFile);
    const fileName = `${Date.now()}.${fileType}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      ACL: "public-read",
      Key: `${Date.now()}.${fileType}`,
      Body: req.file.buffer,
    };
    console.log(myFile);

    s3.upload(params, async (error, data) => {
      if (error) {
        res.status(500).json(error);
      }
      // console.log(params[Key]);

      const videoLink = await Video.create({
        fileName: fileName,
        url: data.Location,
        userId: req.user.user_id,
      });
      await videoLink.save();

      const userVideo = await UserVideo.create({
        userEmail: req.user.email,
        videoId: videoLink.id,
      });
      console.log(req.user.email);
      const details = {
        watchableLink: `videorecorderbackend.herokuapp.com/${videoLink.id}/watch`,
        downloadableLink: data.Location,
        file: fileName,
      };
      console.log(userVideo);
      console.log(videoLink);
      res.status(200).json(details);
    });
  } catch (e) {
    return new ExpressError(e);
  }
};

module.exports.getRegister = async (req, res) => {
  // if (req.cookies["cookietokenkey"]) {
  //   res.redirect("/home");
  // } else {
  res.render("user/register", { loginErr: false });
  // }
};

module.exports.postRegister = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const oldUser = await User.findOne({ where: { email: email } });
    console.log(oldUser);
    if (oldUser) {
      //return next(new ExpressError("User Already Exist", 409));
      res.render("user/register", { loginErr: true });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    console.log(encryptedPassword);

    const user = await User.create({
      username,
      email,
      password: encryptedPassword,
      loginType: "login",
    });

    res.redirect("/login");
  } catch (e) {
    console.log(e);
    return next(new ExpressError(e));
  }
};

// app.get("/send", function (req, res) {
//   rand = Math.floor(Math.random() * 100 + 54);
//   host = req.get("host");
//   link = "http://" + req.get("host") + "/verify?id=" + rand;
//   mailOptions = {
//     to: req.query.to,
//     subject: "Please confirm your Email account",
//     html:
//       "Hello,<br> Please Click on the link to verify your email.<br><a href=" +
//       link +
//       ">Click here to verify</a>",
//   };
//   console.log(mailOptions);
//   smtpTransport.sendMail(mailOptions, function (error, response) {
//     if (error) {
//       console.log(error);
//       res.end("error");
//     } else {
//       console.log("Message sent: " + response.message);
//       res.end("sent");
//     }
//   });
// });

// app.get("/verify", function (req, res) {
//   console.log(req.protocol + ":/" + req.get("host"));
//   if (req.protocol + "://" + req.get("host") == "http://" + host) {
//     console.log("Domain is matched. Information is from Authentic email");
//     if (req.query.id == rand) {
//       console.log("email is verified");
//       res.end("<h1>Email " + mailOptions.to + " is been Successfully verified");
//     } else {
//       console.log("email is not verified");
//       res.end("<h1>Bad Request</h1>");
//     }
//   } else {
//     res.end("<h1>Request is from unknown source");
//   }
// });

module.exports.getLogin = async (req, res) => {
  // if (req.cookies["cookietokenkey"]) {
  //   res.redirect("/home");
  // } else {
  res.render("user/login", { loginErr: false, userErr: false });
  // }
};

module.exports.postLogin = async (req, res, next) => {
  try {
    console.log("req.body");
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      console.log("user");

      if (match) {
        const token = jwt.sign(
          { user_id: user.id, email },
          process.env.TOKEN_KEY
        );
        // save user token
        user.token = token;

        await user.save();
        console.log(token, "token");
        res.cookie("cookietokenkey", token, {
          httpOnly: false,
          secure: true,
          maxAge: 3600 * 60 * 60 * 24,
        });
        res.redirect("/home");
      } else {
        //return next(new ExpressError("Invalid Password"));
        var loginErr = true;
        res.render("user/login", { loginErr, userErr: false });
      }
    } else {
      // return next(new ExpressError("User doesnot exist "));
      res.render("user/login", { loginErr: false, userErr: true });
    }
  } catch (e) {
    console.log(e);
    return next(new ExpressError(e));
  }
};

module.exports.googleLogin = async (req, res) => {
  let token = req.body.token;

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
    console.log(payload);
    const user = await User.findOne({ where: { email: payload.email } });
    if (!user) {
      const newUser = await User.create({
        email: payload.email,
        token,
        loginType: "googleLogin",
      });
    }
  }
  verify()
    .then(() => {
      res.cookie("cookietokenkey", token, {
        httpOnly: true,
        secure: true,
        // maxAge: 1,
        maxAge: 3600 * 60 * 60 * 24,
      });

      res.send("success");
    })

    .catch(console.error);
  //   res.redirect("chrome:extensions");
};

module.exports.settings = async (req, res) => {
  // var photo = false;
  const user = await User.findOne({ where: { email: req.user.email } });
  // var path = `public/profilepic/${user.username}.jpg`;
  // if (fs.existsSync(path)) {
  // path exists
  // photo = true;
  // console.log("exists:", path);
  // }
  res.render("user/setting", {
    user,
    passErr: false,
    noMatch: false,
    success: false,
  });
};

module.exports.loginSuccess = async (req, res) => {
  // if (req.cookies["cookietokenkey"]) {
  res.render("user/myVideo");
};

module.exports.sharedWithMe = async (req, res) => {
  const userEmail = req.user.email;
  const user = await User.findOne({ where: { id: req.user.user_id } });
  const uservideos = await UserVideo.findAll({
    where: { userEmail: userEmail },
  });
  // const uservideos = await Video.findAll({
  //   where: {
  //     userId: {
  //       [sequelize.Op.not]: userVideos.id,
  //     },
  //   },
  // });
  // res.render("user/me", { uservideos });
  res.render("user/me", { uservideos });
};

module.exports.sharedWithOthers = async (req, res) => {
  // const userEmail = req.user.email;
  const user = await User.findOne({ where: { id: req.user.user_id } });
  // console.log(user);
  const userVideos = await UserVideo.findAll({
    where: { userId: user.id },
  });
  // console.log(userVideos);
  const videos = await Video.findAll({
    where: { userId: req.user.user_id },
  });

  res.render("user/team", { videos, user });
};

module.exports.personal = async (req, res) => {
  console.log("user token", req.user.token);
  const userEmail = req.user.email;
  const user = await User.findOne({ where: { id: req.user.user_id } });
  const uservideos = await Video.findAll({
    where: { userId: user.id },
  });
  // console.log(uservideos);
  res.render("user/myVideo", { uservideos, user, userEmail });
};

module.exports.userVideoLink = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const video = await Video.findOne({ where: { id: id } });
  res.render("user/video", { video, user });
};

module.exports.downloadVideo = async (req, res) => {
  // const email = req.user.email;
  const videoLink = await Video.findOne({
    where: { userId: req.user.user_id },
    order: [["id", "DESC"]],
  });
  console.log(videoLink);
  res.json(videoLink.url);
};

module.exports.userDetails = async (req, res) => {
  // const user = req.user;
  res.json(req.user);
};

module.exports.publicOrPrivate = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  const video = await Video.findOne({ where: { id: id } });
  console.log(video);
  if (status != video.status) {
    video.status = status;
    await video.save();
    res.redirect(`/${id}/watch`);
  } else {
    console.log("no change");
    res.redirect(`/${id}/watch`);
  }
};

module.exports.AddteamMembers = async (req, res) => {
  const { id } = req.params;
  const { teamMembers } = req.body;
  console.log(teamMembers);
  const video = await Video.findOne({ where: { id: id } });
  // video.teamMembers.push("," + teamMembers);
  if (video.teamMembers) {
    var members = video.teamMembers.split(",");
    // if (members.indexOf(teamMembers) != -1) {
    members.push(teamMembers);
    // }
    video.teamMembers = members.join(",");
  } else {
    video.teamMembers = teamMembers;
  }

  await video.save();
  res.redirect(`/${id}/watch`);
};

module.exports.DeleteteamMembers = async (req, res) => {
  const { id } = req.params;
  const { teamMembers } = req.body;
  const video = await Video.findOne({ where: { id: id } });
  video.teamMembers = NULL;
  await video.save();
  res.redirect(`${id}/watch`);
};

module.exports.meetingNotes = async (req, res) => {
  const { id } = req.params;
  const { meetingNotes } = req.body;
  const video = await Video.findOne({ where: { id: id } });
  console.log(meetingNotes);
  video.meetingNotes = meetingNotes;
  await video.save();
  res.redirect(`/${id}/watch`);
};

module.exports.changeFileName = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const video = await Video.findOne({ where: { id: id } });
  video.fileName = name;
  await video.save();
  res.redirect(`/${id}/watch`);
};

module.exports.changeUserName = async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ where: { id: req.user.user_id } });
  user.username = username;
  await user.save();
  res.redirect("/settings");
};

module.exports.publicSharableLink = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findOne({ where: { id: id } });
  res.render("user/publicVideoPage", { video });
};

module.exports.changePassword = async (req, res) => {
  const { password, newPassword, confirmPassword } = req.body;
  const user = await User.findOne({ where: { id: req.user.user_id } });
  const match = await bcrypt.compare(password, user.password);
  if (match) {
    if (newPassword == confirmPassword) {
      newEncryptedPassword = await bcrypt.hash(newPassword, 10);
      console.log(newEncryptedPassword);
      user.password = newEncryptedPassword;
      await user.save();
      res.render("user/setting", {
        user,
        noMatch: false,
        passErr: false,
        success: true,
      });
    } else {
      res.render("user/setting", {
        user,
        noMatch: true,
        passErr: false,
        success: false,
      });
      console.log("no MATCH");
    }
  } else {
    res.render("user/setting", {
      user,
      passErr: true,
      noMatch: false,
      success: false,
    });
    console.log("Wrong password");
  }
};
// module.exports.uploadPhoto = async (req, res) => {
//   console.log("photoUpload");
//   console.log(req.files);
//   if (req.files) {
//     console.log(req.files.mypic);
//     var image = req.files.mypic;
//     const user = await User.findOne({ where: { id: req.user.user_id } });
//     user.profilePicture = image;
//     console.log(req.body.username);
//     var filepath = `C:/Users/TOSHIBA/Desktop/videoRecorderBackend-main/public/profilepic/${req.body.username}.jpg`;
//     console.log(filepath);
//     image.mv(filepath, (err) => {
//       console.log(err);
//     });
//     res.redirect("/settings");
//   }
//   res.redirect("/settings");
// };

module.exports.uploadPhoto = async (req, res) => {
  console.log(req.body);
  console.log(req.file);
  try {
    myFile = req.file.originalname.split(".");
    fileType = myFile[myFile.length - 1];
    // console.log(myFile);
    const profilePicName = `${req.body.username}.${fileType}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME_TWO,
      ACL: "public-read",
      Key: profilePicName,
      Body: req.file.buffer,
    };
    console.log(myFile);

    s3.upload(params, async (error, data) => {
      if (error) {
        res.status(500).json(error);
      }
      // console.log(params[Key]);
      const user = await User.findOne({ where: { id: req.user.user_id } });
      user.profilePicture = data.Location;
      await user.save();
      console.log(data.Location);
      res.status(200).redirect("/settings");
    });
  } catch (e) {
    return new ExpressError(e);
  }
};

module.exports.removeProfilePic = async (req, res) => {
  const user = await User.findOne({ where: { id: req.user.user_id } });
  user.profilePicture = null;
  await user.save();
  res.redirect("/settings");
};

module.exports.logout = (req, res) => {
  res.clearCookie("cookietokenkey");
  res.redirect("/");
};
